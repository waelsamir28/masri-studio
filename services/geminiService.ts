
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { VoicePreset, VoiceActor } from "../types";

// Helper to convert PCM to WAV
export const pcmToWav = (pcmData: Uint8Array, sampleRate: number = 24000): Blob => {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmData.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); 
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);
  const bytes = new Uint8Array(buffer, 44);
  bytes.set(pcmData);
  return new Blob([buffer], { type: 'audio/wav' });
};

const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
};

// Retry Helper with Exponential Backoff
const retryWithBackoff = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const msg = error.message || error.toString() || JSON.stringify(error);
    const isQuota = msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
    const isServerOverload = msg.includes('503') || msg.includes('overloaded');
    
    if (retries > 0 && (isQuota || isServerOverload)) {
      // Wait for delay then retry
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

const handleGeminiError = (error: any) => {
  console.error("Gemini API Error:", error);
  const msg = error.message || error.toString();
  
  if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
    throw new Error("⚠️ Usage Limit Exceeded (429). Please wait a minute or check your API plan.");
  }
  if (msg.includes('500') || msg.includes('internal')) {
     throw new Error("⚠️ AI Service Busy. Please try again.");
  }
  throw new Error(`AI Error: ${msg.substring(0, 50)}...`);
};

/**
 * Generates a creative text script based on a topic
 */
export const generateTextScript = async (
  topic: string, 
  length: 'SHORT' | 'MEDIUM' | 'LONG',
  lang: 'en' | 'ar'
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const lengthInstruction = {
    'SHORT': '1-2 sentences, catchy and punchy.',
    'MEDIUM': '2-4 sentences, engaging flow.',
    'LONG': 'A full detailed monologue or story.'
  }[length];

  const prompt = `
    Act as a professional Egyptian Creative Copywriter.
    Write a script in authentic Egyptian Arabic (Ammiya) about: "${topic}".
    Length: ${lengthInstruction}
    
    IMPORTANT: 
    - Insert natural pauses using "..." and commas.
    - Add emotion markers like (ضحكة) or (تنهيدة) if appropriate.
    - Use expressive punctuation (! ؟ -).
    - Return ONLY the script text.
  `;

  try {
    const response = await retryWithBackoff<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ parts: [{ text: prompt }] }],
    }));

    const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? text.trim() : "";
  } catch (error) {
    handleGeminiError(error);
    return "";
  }
};

/**
 * Enhances existing text to match a specific character persona with dramatic markers
 */
export const enhanceScriptWithActor = async (
  currentText: string,
  actor: VoiceActor,
  lang: 'en' | 'ar'
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Rewrite and ENHANCE the following text for a cinematic voice performance in Egyptian Arabic.
    Target Character: ${actor.name} (${actor.description})
    
    Original Text: "${currentText}"
    
    INSTRUCTIONS FOR ENHANCEMENT:
    1. PUNCTUATION: Add lots of "..." for dramatic pauses, "," for breathing, and "-" for sudden shifts.
    2. EMOTION: Insert emotional cues between parentheses like (ضحكة خفيفة), (تنهيدة), (بصوت واثق), (بهمس) where it makes the performance better.
    3. STYLE: Use "!" for excitement and "؟" for curiosity. Add repetitive words if it fits the Egyptian street style (e.g. "يعني.. يعني").
    4. CHARACTER: Make the vocabulary match ${actor.nameAr}'s personality perfectly.
    
    Return ONLY the enhanced text. Do not add explanations.
  `;

  try {
    const response = await retryWithBackoff<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ parts: [{ text: prompt }] }],
    }));
    
    const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? text.trim() : currentText;
  } catch (error) {
    console.warn("Enhancement skipped due to error:", error);
    return currentText; 
  }
};

export const generateSpeech = async (
  text: string, 
  actor: VoiceActor,
  preset: VoicePreset | null,
  customTone: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const geminiModelName = actor.geminiModel;

  let styleDescription = "Natural";
  if (customTone && customTone.trim().length > 0) {
    styleDescription = customTone;
  } else if (preset) {
    styleDescription = preset.systemPrompt;
  }

  // The model works better if we tell it the markers like (ضحكة) are instructions
  const prompt = `Perform the following Egyptian script. 
  Follow the punctuation like '...' for pauses and (action) for emotions. 
  Tone: ${styleDescription}.
  
  Script: "${text}"`;

  try {
    const response = await retryWithBackoff<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO], 
        speechConfig: {
          voiceConfig: { 
            prebuiltVoiceConfig: { voiceName: geminiModelName } 
          },
        },
      },
    }));

    const candidate = response.candidates?.[0];
    const contentPart = candidate?.content?.parts?.[0];

    if (contentPart?.text) {
        throw new Error(`Model Error: ${contentPart.text}`);
    }

    const base64 = contentPart?.inlineData?.data;
    if (!base64) throw new Error("Audio generation failed: No audio data returned.");

    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    
    return URL.createObjectURL(pcmToWav(bytes, 24000));
    
  } catch (error) {
    handleGeminiError(error);
    return "";
  }
};
