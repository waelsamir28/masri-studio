

/**
 * Voice Processor Engine
 * Handles Audio Playback, Pitch Shifting, and Speed control for character voices.
 */
export class VoiceProcessor {
  private ctx: AudioContext;
  private sourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode;
  private isPlaying: boolean = false;
  
  // Analyser for visualization
  public analyser: AnalyserNode;

  constructor() {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    this.gainNode = this.ctx.createGain();
    this.analyser = this.ctx.createAnalyser();
    
    this.analyser.fftSize = 256;
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  /**
   * Processes raw PCM data from Gemini and applies character effects (Pitch/Speed)
   */
  public async processAndPlay(
    audioUrl: string, 
    pitchFactor: number = 1.0, 
    speedFactor: number = 1.0,
    onEnded?: () => void
  ): Promise<void> {
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    this.stop(); // Stop any current playback

    try {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);

      this.sourceNode = this.ctx.createBufferSource();
      this.sourceNode.buffer = audioBuffer;

      // --- DSP EFFECTS ---
      
      // 1. Speed (Playback Rate)
      const combinedRate = speedFactor * pitchFactor; 
      this.sourceNode.playbackRate.value = combinedRate;

      this.sourceNode.connect(this.gainNode);
      
      this.sourceNode.onended = () => {
        this.isPlaying = false;
        if (onEnded) onEnded();
      };

      this.sourceNode.start(0);
      this.isPlaying = true;

    } catch (e) {
      console.error("Error playing audio:", e);
      if (onEnded) onEnded();
    }
  }

  public stop() {
    if (this.sourceNode) {
      try { this.sourceNode.stop(); } catch(e) {}
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    this.isPlaying = false;
  }

  public resume() {
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  /**
   * Export the processed audio (applied pitch/speed) as a WAV file
   */
  public async exportProcessedAudio(audioUrl: string, pitchFactor: number, speedFactor: number): Promise<Blob> {
    // Decode original
    const response = await fetch(audioUrl);
    const ab = await response.arrayBuffer();
    const originalBuffer = await this.ctx.decodeAudioData(ab);

    // Calculate new duration based on speed
    const combinedRate = speedFactor * pitchFactor;
    const newDuration = originalBuffer.duration / combinedRate;
    const lengthSamples = Math.ceil(newDuration * originalBuffer.sampleRate);

    // Offline render
    const offlineCtx = new OfflineAudioContext(1, lengthSamples, originalBuffer.sampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = originalBuffer;
    source.playbackRate.value = combinedRate;
    
    source.connect(offlineCtx.destination);
    source.start(0);

    const renderedBuffer = await offlineCtx.startRendering();
    return this.bufferToWav(renderedBuffer);
  }

  private bufferToWav(abuffer: AudioBuffer) {
    const numOfChan = abuffer.numberOfChannels;
    const len = abuffer.length;
    const length = len * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    let channels = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;
  
    // Header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);
  
    for(i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i));
  
    while(pos < length) {
      for(i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++
    }
  
    return new Blob([buffer], { type: "audio/wav" });
  
    function setUint16(data: any) { view.setUint16(pos, data, true); pos += 2; }
    function setUint32(data: any) { view.setUint32(pos, data, true); pos += 4; }
  }
}
