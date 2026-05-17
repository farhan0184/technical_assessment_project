"use client";

import { SurahDetail } from "@/lib/quran-api";
import React, { createContext, useContext, useEffect, useState, useRef } from "react";


type Theme = "light" | "dark" | "sepia" | "system";
type ArabicFont = "font-amiri" | "font-scheherazade" | "font-lateef";

interface Settings {
  theme: Theme;
  arabicFont: ArabicFont;
  arabicFontSize: number;
  translationFontSize: number;
}

interface SettingsContextType extends Settings {
  setTheme: (theme: Theme) => void;
  setArabicFont: (font: ArabicFont) => void;
  setArabicFontSize: (size: number) => void;
  setTranslationFontSize: (size: number) => void;

  // Audio Player State & Controls
  playingSurah: SurahDetail | null;
  activeAyahIndex: number | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  surahCurrentTime: number;
  surahDuration: number;
  playAyah: (surah: SurahDetail, index: number) => void;
  togglePlay: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
  stopAudio: () => void;
  seekAudio: (time: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Perfect speed estimation helper based on user's exact 0.07s character coefficient
export const estimateAyahDuration = (text: string) => {
  return Math.max(3, text.length * 0.07 + 1.8);
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    theme: "system",
    arabicFont: "font-scheherazade",
    arabicFontSize: 36,
    translationFontSize: 16,
  });

  const [mounted, setMounted] = useState(false);

  // Audio Engine States
  const [playingSurah, setPlayingSurah] = useState<SurahDetail | null>(null);
  const [activeAyahIndex, setActiveAyahIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loadedDurations, setLoadedDurations] = useState<{ [index: number]: number }>({});

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const stateRef = useRef({ playingSurah, activeAyahIndex });

  // Sync ref with states to prevent closure captures in event listeners
  useEffect(() => {
    stateRef.current = { playingSurah, activeAyahIndex };
  }, [playingSurah, activeAyahIndex]);

  // Reset loaded durations when Surah changes
  useEffect(() => {
    setLoadedDurations({});
  }, [playingSurah?.number]);

  useEffect(() => {
    const saved = localStorage.getItem("quran-settings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("quran-settings", JSON.stringify(settings));

    // Apply theme
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", "sepia");
    
    if (settings.theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(settings.theme);
    }
  }, [settings, mounted]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (nextAudioRef.current) {
        nextAudioRef.current.pause();
      }
    };
  }, []);

  // Compute Surah cumulative durations and offsets using purely locked estimations
  const getSurahDurations = () => {
    if (!playingSurah) return { total: 0, cumulativeOffsets: [] };
    let total = 0;
    const cumulativeOffsets: number[] = [];
    
    playingSurah.ayahs.forEach((ayah) => {
      cumulativeOffsets.push(total);
      total += estimateAyahDuration(ayah.text);
    });
    
    return { total, cumulativeOffsets };
  };

  const { total: surahDuration, cumulativeOffsets: ayahOffsets } = getSurahDurations();
  
  const getSurahCurrentTime = () => {
    if (!playingSurah || activeAyahIndex === null || ayahOffsets[activeAyahIndex] === undefined) return 0;
    
    const estOffset = ayahOffsets[activeAyahIndex];
    const estDuration = estimateAyahDuration(playingSurah.ayahs[activeAyahIndex].text);
    const realDuration = loadedDurations[activeAyahIndex];
    
    if (realDuration && realDuration > 0) {
      // Proportional algebraic scaling to prevent timeline stutters
      const ratio = Math.min(1.0, Math.max(0.0, currentTime / realDuration));
      return estOffset + ratio * estDuration;
    }
    
    return estOffset + currentTime;
  };
  
  const surahCurrentTime = getSurahCurrentTime();

  // Background preload helper to download next Ayah and capture its real duration
  const preloadNextAyah = (surah: SurahDetail, currentIndex: number) => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < surah.ayahs.length) {
      const nextAyah = surah.ayahs[nextIndex];
      if (nextAyah?.audio) {
        const nextAudio = new Audio(nextAyah.audio);
        nextAudio.preload = "auto";
        
        nextAudio.addEventListener("loadedmetadata", () => {
          const realDuration = nextAudio.duration || 0;
          setLoadedDurations(prev => ({
            ...prev,
            [nextIndex]: realDuration
          }));
        });

        nextAudio.load();
        nextAudioRef.current = nextAudio;
      }
    } else {
      nextAudioRef.current = null;
    }
  };

  const playAyah = (surah: SurahDetail, index: number) => {
    if (playingSurah?.number === surah.number && activeAyahIndex === index) {
      togglePlay();
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const ayah = surah.ayahs[index];
    if (!ayah?.audio) return;

    setPlayingSurah(surah);
    setActiveAyahIndex(index);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);

    let audio: HTMLAudioElement;
    // Consume preloaded track if available and matching
    if (nextAudioRef.current && nextAudioRef.current.src === ayah.audio) {
      audio = nextAudioRef.current;
      nextAudioRef.current = null;
    } else {
      audio = new Audio(ayah.audio);
    }
    
    audioRef.current = audio;

    // Immediately fetch duration if already pre-loaded
    if (audio.duration) {
      const realDuration = audio.duration;
      setDuration(realDuration);
      setLoadedDurations(prev => ({
        ...prev,
        [index]: realDuration
      }));
    }

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener("loadedmetadata", () => {
      const realDuration = audio.duration || 0;
      setDuration(realDuration);
      setLoadedDurations(prev => ({
        ...prev,
        [index]: realDuration
      }));
    });

    audio.addEventListener("ended", () => {
      skipNext();
    });

    audio.play().catch(err => {
      console.error("Audio playback error:", err);
      setIsPlaying(false);
    });

    // Preload the next track in the background immediately!
    preloadNextAyah(surah, index);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => console.error(err));
      setIsPlaying(true);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (nextAudioRef.current) {
      nextAudioRef.current.pause();
      nextAudioRef.current = null;
    }
    setPlayingSurah(null);
    setActiveAyahIndex(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const seekAudio = (targetSurahTime: number) => {
    if (!playingSurah || activeAyahIndex === null) return;
    
    const { total, cumulativeOffsets } = getSurahDurations();
    const clampedTime = Math.max(0, Math.min(targetSurahTime, total));
    
    // Find target Ayah index
    let targetIndex = playingSurah.ayahs.length - 1;
    for (let i = 0; i < cumulativeOffsets.length - 1; i++) {
      if (clampedTime >= cumulativeOffsets[i] && clampedTime < cumulativeOffsets[i + 1]) {
        targetIndex = i;
        break;
      }
    }
    
    const estOffsetInAyah = clampedTime - cumulativeOffsets[targetIndex];
    const estDuration = estimateAyahDuration(playingSurah.ayahs[targetIndex].text);
    const realDuration = loadedDurations[targetIndex];
    const offsetInAyah = realDuration && realDuration > 0
      ? (estOffsetInAyah / estDuration) * realDuration
      : estOffsetInAyah;
    
    if (activeAyahIndex === targetIndex) {
      if (audioRef.current) {
        audioRef.current.currentTime = offsetInAyah;
        setCurrentTime(offsetInAyah);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      const ayah = playingSurah.ayahs[targetIndex];
      if (!ayah?.audio) return;
      
      setActiveAyahIndex(targetIndex);
      setIsPlaying(true);
      setCurrentTime(offsetInAyah);
      setDuration(0);
      
      let audio: HTMLAudioElement;
      if (nextAudioRef.current && nextAudioRef.current.src === ayah.audio) {
        audio = nextAudioRef.current;
        nextAudioRef.current = null;
      } else {
        audio = new Audio(ayah.audio);
      }
      
      audioRef.current = audio;

      if (audio.duration) {
        const realDuration = audio.duration;
        setDuration(realDuration);
        setLoadedDurations(prev => ({
          ...prev,
          [targetIndex]: realDuration
        }));
      }
      
      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime);
      });
      
      audio.addEventListener("loadedmetadata", () => {
        const realDuration = audio.duration || 0;
        setDuration(realDuration);
        setLoadedDurations(prev => ({
          ...prev,
          [targetIndex]: realDuration
        }));
      });
      
      audio.addEventListener("ended", () => {
        skipNext();
      });

      audio.addEventListener("loadeddata", () => {
        audio.currentTime = offsetInAyah;
      });
      
      audio.play().catch(err => {
        console.error("Audio playback error:", err);
        setIsPlaying(false);
      });

      // Preload next track based on new target index
      preloadNextAyah(playingSurah, targetIndex);
    }
  };

  const skipNext = () => {
    const { playingSurah: currentSurah, activeAyahIndex: currentIndex } = stateRef.current;
    if (!currentSurah || currentIndex === null) return;

    const nextIndex = currentIndex + 1;
    if (nextIndex < currentSurah.ayahs.length) {
      playAyah(currentSurah, nextIndex);
    } else {
      stopAudio();
    }
  };

  const skipPrevious = () => {
    const { playingSurah: currentSurah, activeAyahIndex: currentIndex } = stateRef.current;
    if (!currentSurah || currentIndex === null) return;

    if (audioRef.current && audioRef.current.currentTime > 3) {
      seekAudio(ayahOffsets[currentIndex]);
      return;
    }

    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      playAyah(currentSurah, prevIndex);
    } else {
      seekAudio(0);
    }
  };

  const value = {
    ...settings,
    setTheme: (theme: Theme) => setSettings((s) => ({ ...s, theme })),
    setArabicFont: (arabicFont: ArabicFont) => setSettings((s) => ({ ...s, arabicFont })),
    setArabicFontSize: (arabicFontSize: number) => setSettings((s) => ({ ...s, arabicFontSize })),
    setTranslationFontSize: (translationFontSize: number) => setSettings((s) => ({ ...s, translationFontSize })),

    // Audio states & controls
    playingSurah,
    activeAyahIndex,
    isPlaying,
    currentTime,
    duration,
    surahCurrentTime,
    surahDuration,
    playAyah,
    togglePlay,
    skipNext,
    skipPrevious,
    stopAudio,
    seekAudio,
  };

  return (
    <SettingsContext.Provider value={value}>
      <div style={{ visibility: mounted ? "visible" : "hidden" }}>
        {children}
      </div>
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    // Return a safe fallback to prevent crashes during HMR desync or standalone testing
    return {
      theme: "system" as const,
      setTheme: () => {},
      arabicFont: "font-scheherazade" as const,
      setArabicFont: () => {},
      arabicFontSize: 36,
      setArabicFontSize: () => {},
      translationFontSize: 16,
      setTranslationFontSize: () => {},

      // Audio fallbacks
      playingSurah: null,
      activeAyahIndex: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      surahCurrentTime: 0,
      surahDuration: 0,
      playAyah: () => {},
      togglePlay: () => {},
      skipNext: () => {},
      skipPrevious: () => {},
      stopAudio: () => {},
      seekAudio: () => {},
    };
  }
  return context;
}