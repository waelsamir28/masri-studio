import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  appName: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, appName }) => {
  const [progress, setProgress] = useState(0);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Show text after 1 second
    const textTimer = setTimeout(() => setShowText(true), 1000);
    
    // Progress animation over 5 seconds
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => {
      clearInterval(interval);
      clearTimeout(textTimer);
    };
  }, [onComplete]);

  return (
    <div className="splash-screen">
      {/* Logo */}
      <div className="splash-logo mb-8">
        <i className="fas fa-microphone text-white text-5xl"></i>
      </div>

      {/* Sound Waves */}
      <div className="splash-wave mb-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="splash-wave-bar"
            style={{
              animationDelay: `${i * 0.1}s`,
              height: `${20 + Math.random() * 40}px`
            }}
          ></div>
        ))}
      </div>

      {/* App Name */}
      {showText && (
        <div className="text-center animate-scale-in">
          <h1 className="splash-text mb-2">{appName}</h1>
          <p className="text-cyan-300/60 text-sm font-medium">Premium AI Voice Studio</p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48">
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-center text-cyan-300/40 text-xs mt-2">{progress}%</p>
      </div>
    </div>
  );
};
