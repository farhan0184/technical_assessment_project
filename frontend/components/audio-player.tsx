"use client";

import { useSettings } from "@/components/providers";
import { Play, Pause, SkipBack, SkipForward, X, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export function BottomAudioPlayer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    playingSurah,
    activeAyahIndex,
    isPlaying,
    surahCurrentTime,
    surahDuration,
    togglePlay,
    skipNext,
    skipPrevious,
    stopAudio,
    seekAudio,
  } = useSettings();

  if (!mounted) return null;

  const isVisible = playingSurah !== null;
  const activeAyah = playingSurah && activeAyahIndex !== null ? playingSurah.ayahs[activeAyahIndex] : null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === Infinity) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 h-18 md:h-20 bg-sidebar border-t border-border/40 z-50 transition-all ease-in-out select-none",
        isVisible 
          ? "translate-y-0 opacity-100 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.3)]" 
          : "translate-y-full opacity-0 pointer-events-none"
      )}
    >
      {/* 1. Custom Interactive Progress Slider */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-muted/20 cursor-pointer group">
        <div
          className="h-full bg-primary relative transition-all duration-100"
          style={{ width: `${surahDuration ? (surahCurrentTime / surahDuration) * 100 : 0}%` }}
        >
          {/* Hover playhead node */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary shadow scale-0 group-hover:scale-100 transition-transform duration-150" />
        </div>
        <input
          type="range"
          min={0}
          max={surahDuration || 100}
          value={surahCurrentTime}
          onChange={(e) => seekAudio(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          title="Seek Audio"
        />
      </div>

      {/* 2. Controls and Metadata Layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center justify-center relative">
        {/* Left Side: Metadata (Absolute on desktop/tablet to keep controls dead-center) */}
        {playingSurah && activeAyah && (
          <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col min-w-0 max-w-[200px]">
            <span className="text-sm md:text-base font-bold text-primary truncate tracking-wide">
              {playingSurah.englishName} : {activeAyah.numberInSurah}
            </span>
          </div>
        )}

        {/* Center Side: Player Controls (Perfectly centered across full width) */}
        <div className="flex items-center gap-3.5 md:gap-6 shrink-0 justify-center">
          {/* Playback Current Time */}
          <span className="text-xs md:text-sm text-muted-foreground font-mono tracking-wider">
            {formatTime(surahCurrentTime)}
          </span>

          {/* Options button */}
          <button className="text-muted-foreground hover:text-primary transition-colors cursor-pointer" title="Audio Settings">
            <MoreHorizontal className="h-4.5 w-4.5" />
          </button>

          {/* Previous Track */}
          <button
            onClick={skipPrevious}
            className="text-muted-foreground hover:text-primary active:scale-90 transition-all focus:outline-none"
            title="Previous Ayah"
          >
            <SkipBack className="h-4.5 w-4.5 md:h-5 md:w-5 fill-current" />
          </button>

          {/* Play/Pause Circle Button */}
          <button
            onClick={togglePlay}
            className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all shadow-sm hover:shadow"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-4.5 w-4.5 md:h-5 md:w-5 fill-current" />
            ) : (
              <Play className="h-4.5 w-4.5 md:h-5 md:w-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={skipNext}
            className="text-muted-foreground hover:text-primary active:scale-90 transition-all focus:outline-none"
            title="Next Ayah"
          >
            <SkipForward className="h-4.5 w-4.5 md:h-5 md:w-5 fill-current" />
          </button>

          {/* Stop / Close Player */}
          <button
            onClick={stopAudio}
            className="text-muted-foreground hover:text-primary active:scale-90 transition-all focus:outline-none"
            title="Stop & Close Player"
          >
            <X className="h-4.5 w-4.5 md:h-5 md:w-5" />
          </button>

          {/* Playback Total Duration */}
          <span className="text-xs md:text-sm text-muted-foreground font-mono tracking-wider">
            {formatTime(surahDuration)}
          </span>
        </div>
      </div>
    </div>
  );
}
