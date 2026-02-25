import { useEffect, useState } from 'react';

export function useAwradPreferences() {
  const [arabicFontSize, setArabicFontSize] = useState(28);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('awradPrefs');
    if (stored) {
      try {
        const prefs = JSON.parse(stored);
        if (prefs.arabicFontSize) setArabicFontSize(prefs.arabicFontSize);
        if (typeof prefs.showTranslation === 'boolean') setShowTranslation(prefs.showTranslation);
        if (typeof prefs.showTransliteration === 'boolean') setShowTransliteration(prefs.showTransliteration);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('awradPrefs', JSON.stringify({ arabicFontSize, showTranslation, showTransliteration }));
  }, [arabicFontSize, showTranslation, showTransliteration]);

  return {
    arabicFontSize,
    setArabicFontSize,
    showTranslation,
    setShowTranslation,
    showTransliteration,
    setShowTransliteration,
  };
}
