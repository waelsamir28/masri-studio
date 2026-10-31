

import React, { useState, useEffect } from 'react';
import { VoiceForm } from './components/SongForm'; 
import { ResultsView } from './components/ResultsView';
import { GeneratedSpeech, GenerationState, VoicePreset, VoiceActor } from './types';
import { generateSpeech } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<GenerationState>(GenerationState.IDLE);
  const [history, setHistory] = useState<GeneratedSpeech[]>([]);
  const [lang, setLang] = useState<'en' | 'ar'>('ar'); 
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check system preference or saved theme
    const savedTheme = localStorage.getItem('masri-theme') as 'dark' | 'light' | null;
    if (savedTheme) {
        setTheme(savedTheme);
        if (savedTheme === 'light') document.body.classList.add('light-mode');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('masri-theme', newTheme);
    
    if (newTheme === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
  };

  const handleGenerate = async (text: string, actor: VoiceActor, preset: VoicePreset | null, customTone: string) => {
    setStatus(GenerationState.GENERATING);
    setErrorMessage(null);
    try {
      const audioUrl = await generateSpeech(text, actor, preset, customTone);
      const newSpeech: GeneratedSpeech = {
        id: Date.now().toString(),
        text,
        actor, // Store the actor used
        preset, // Store the preset used (renamed from voicePreset for consistency)
        customTone: customTone || undefined,
        audioUrl,
        timestamp: Date.now()
      };
      setHistory(prev => [newSpeech, ...prev]);
      setStatus(GenerationState.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setStatus(GenerationState.ERROR);
      setErrorMessage(err.message || "An unexpected error occurred.");
      
      // Auto clear after 7 seconds
      setTimeout(() => setErrorMessage(null), 7000);
    }
  };

  const handleDelete = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className={`min-h-screen flex flex-col items-center font-sans ${lang === 'ar' ? 'dir-rtl' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* ERROR BANNER */}
      {errorMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-lg animate-bounce-in">
           <div className="bg-red-950/90 border border-red-500/50 text-red-100 px-4 py-3 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.4)] backdrop-blur-md flex items-center gap-3">
              <i className="fas fa-circle-exclamation text-red-500 text-xl"></i>
              <div className="flex-1 text-xs font-bold">{errorMessage}</div>
              <button onClick={() => setErrorMessage(null)} className="text-white/40 hover:text-white transition-colors">
                <i className="fas fa-times"></i>
              </button>
           </div>
        </div>
      )}

      <div className="w-full max-w-2xl z-10 px-4 py-6 flex-1 flex flex-col">
         
         {/* Top Controls (Lang & Theme) */}
         <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full bg-surface border border-border text-txt-secondary hover:text-accent hover:border-accent transition-all flex items-center justify-center shadow-lg"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>

            {/* Language Toggle */}
            <button 
              onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')}
              className="px-3 py-1.5 rounded-full bg-surface border border-border text-[10px] font-bold text-txt-secondary hover:text-txt-primary uppercase tracking-wider shadow-lg"
            >
              {lang === 'ar' ? 'EN' : 'AR'}
            </button>
         </div>

         {/* CONTENT */}
         <div className="flex flex-col gap-6">
             <VoiceForm 
                 onSubmit={handleGenerate} 
                 isLoading={status === GenerationState.GENERATING} 
                 lang={lang}
             />
             <ResultsView history={history} onDelete={handleDelete} lang={lang} />
         </div>
         
         {/* FOOTER - POWER DUBAI */}
         <div className="mt-12 mb-6 text-center opacity-60 hover:opacity-100 transition-opacity">
            <div className="flex flex-col items-center gap-3">
               <div className="flex items-center gap-2">
                  <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-accent"></div>
                  <span className="text-accent font-bold uppercase tracking-widest text-[10px]">Design By</span>
                  <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-accent"></div>
               </div>
               
               <h3 className="text-txt-primary text-sm font-bold tracking-widest">WAEL SAMIR</h3>
               
               <div className="flex items-center gap-1 text-txt-muted text-[9px]">
                  <span className="border border-txt-muted rounded-full w-3 h-3 flex items-center justify-center text-[7px]">R</span>
                  <span>2025</span>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};

export default App;
