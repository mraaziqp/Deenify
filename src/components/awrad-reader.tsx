import React from 'react';
import { useAwradPreferences } from '@/hooks/use-awrad-preferences';

interface AwradLine {
  id: string;
  arabicText: string;
  transliteration?: string;
  translation?: string;
  order: number;
}

interface AwradChapter {
  id: string;
  title: string;
  audioUrl?: string;
  lines: AwradLine[];
}

interface AwradReaderProps {
  chapter: AwradChapter;
}

export const AwradReader: React.FC<AwradReaderProps> = ({ chapter }) => {
  const {
    arabicFontSize,
    setArabicFontSize,
    showTranslation,
    setShowTranslation,
    showTransliteration,
    setShowTransliteration,
  } = useAwradPreferences();
  const [audio, setAudio] = React.useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const handleAudioPlay = () => {
    if (!audio && chapter.audioUrl) {
      const newAudio = new window.Audio(chapter.audioUrl);
      setAudio(newAudio);
      newAudio.play();
      setIsPlaying(true);
      newAudio.onended = () => setIsPlaying(false);
    } else if (audio) {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleAudioPause = () => {
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex flex-col">
      {/* Sticky Control Bar */}
      <div className="sticky top-0 z-10 bg-[#F9F7F2] border-b border-gray-200 px-4 py-3 flex flex-col md:flex-row items-center gap-4">
        {chapter.audioUrl && (
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded bg-primary text-white font-semibold"
              onClick={isPlaying ? handleAudioPause : handleAudioPlay}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <span className="text-sm text-muted-foreground">Audio</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <label className="text-sm">Font Size</label>
          <input
            type="range"
            min={16}
            max={48}
            value={arabicFontSize}
            onChange={e => setArabicFontSize(Number(e.target.value))}
            className="accent-primary"
          />
          <span className="text-sm w-8 text-center">{arabicFontSize}px</span>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showTranslation}
              onChange={e => setShowTranslation(e.target.checked)}
              className="accent-primary"
            />
            <span className="text-sm">Translation</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showTransliteration}
              onChange={e => setShowTransliteration(e.target.checked)}
              className="accent-primary"
            />
            <span className="text-sm">Transliteration</span>
          </label>
        </div>
      </div>
      {/* Reading Canvas */}
      <div className="flex-1 px-4 py-8 max-w-2xl mx-auto">
        {chapter.lines.sort((a, b) => a.order - b.order).map(line => (
          <div key={line.id} className="py-6 border-b border-gray-100">
            <div
              className="font-arabic text-right"
              dir="rtl"
              style={{ fontSize: arabicFontSize }}
            >
              {line.arabicText}
            </div>
            {showTransliteration && line.transliteration && (
              <div className="text-gray-500 italic text-center mt-2">
                {line.transliteration}
              </div>
            )}
            {showTranslation && line.translation && (
              <div className="text-gray-800 text-center font-serif mt-2">
                {line.translation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
