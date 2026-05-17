"use client";

import { SurahDetail } from "@/lib/quran-api";
import { useSettings } from "@/components/providers";
import { Play, Pause, Bookmark, MoreHorizontal, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";

export function AyahList({ surah }: { surah: SurahDetail }) {
  const {
    arabicFont,
    arabicFontSize,
    translationFontSize,
    playingSurah,
    activeAyahIndex,
    isPlaying,
    playAyah,
    currentTime,
    duration,
  } = useSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Smoothly scroll active Ayah card to the center section of the viewport
  useEffect(() => {
    if (activeAyahIndex !== null && playingSurah?.number === surah.number && isPlaying) {
      const activeEl = document.getElementById(`ayah-${activeAyahIndex}`);
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [activeAyahIndex, playingSurah?.number, surah.number, isPlaying]);

  return (
    <div className="flex flex-col gap-6 py-6 ">
      {/* Surah Header Card */}
      {/* Surah Header Card */}
      {(() => {
        const isMadinah = surah.revelationType?.toLowerCase().includes("medin") || surah.revelationType?.toLowerCase().includes("madinah");
        const revelationPlace = isMadinah ? "Madinah" : "Makkah";
        const showBismillah = surah.number !== 1 && surah.number !== 9;

        return (
          <>
            <div className="relative overflow-hidden p-8 text-center flex items-center justify-center">
              {/* Faint Masjid/Kaaba image on the left - hidden on mobile */}
              <div className="hidden md:flex absolute left-6 bottom-0 top-0 w-40 opacity-80 items-center justify-center pointer-events-none select-none">
                <img
                  src={isMadinah ? "/madinah.avif" : "/makkah.avif"}
                  alt={revelationPlace}
                  className="h-40 w-auto object-contain dark:invert"
                />
              </div>

              <div className="flex flex-col items-center justify-center">
                <div>
                  {/* Header Text */}
                  <h2 className="text-3xl font-bold mb-2 text-foreground">
                    Surah {surah.englishName.replace(/-/g, ' ')}
                  </h2>
                  <p className="text-sm text-muted-foreground font-medium">
                    Ayah-{surah.numberOfAyahs}, {revelationPlace}
                  </p>
                </div>
                {/* Show Bismillah if applicable - positioned absolute on desktop, stacked below on mobile */}
                {showBismillah && (
                  <div className="flex items-center justify-center pointer-events-none select-none mt-6 md:mt-0 md:absolute md:right-6 md:bottom-0 md:top-0 w-64 opacity-40">
                    <img
                      src="/bismillah.svg"
                      alt="Bismillah"
                      className="h-12 md:h-16 w-auto object-contain dark:invert"
                    />
                  </div>
                )}
              </div>
            </div>



          </>
        );
      })()}

      {/* Ayahs */}
      {surah.ayahs.map((ayah, index) => {
        const ayahKey = `${surah.number}:${ayah.numberInSurah}`;
        const isCurrentPlaying = playingSurah?.number === surah.number && activeAyahIndex === index && isPlaying;
        return (
          <div
            key={ayah.number}
            id={`ayah-${index}`}
            className="flex gap-8 py-8 border-b border-border/50 last:border-0 group md:px-8 px-4 scroll-mt-20 md:scroll-mt-24"
          >
            {/* Left Control Column */}
            <div className="flex flex-col items-center gap-5 w-12 shrink-0 select-none">
              {/* Ayah Key (e.g. 2:1) */}
              <span className="text-primary font-bold text-lg tracking-wide">
                {ayahKey}
              </span>

              {/* Play Button */}
              <button
                onClick={() => playAyah(surah, index)}
                className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                title={isCurrentPlaying ? "Pause Audio" : "Play Audio"}
              >
                {isCurrentPlaying ? (
                  <Pause className="h-5 w-5 stroke-[1.5] text-primary fill-current" />
                ) : (
                  <Play className="h-5 w-5 stroke-[1.5]" />
                )}
              </button>

              {/* Book Button */}
              <button
                className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                title="Read Tafsir"
              >
                <BookOpen className="h-5 w-5 stroke-[1.5]" />
              </button>

              {/* Bookmark Button */}
              <button
                className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                title="Bookmark Ayah"
              >
                <Bookmark className="h-5 w-5 stroke-[1.5]" />
              </button>

              {/* More Actions (Three Dots) Button */}
              <button
                className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                title="More Options"
              >
                <MoreHorizontal className="h-5 w-5 stroke-[1.5]" />
              </button>
            </div>

            {/* Right Content Column */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Arabic Text (Right Aligned) */}
              <div
                className={`text-right leading-loose transition-all duration-300 ${mounted ? arabicFont : "font-scheherazade"}`}
                style={{ fontSize: mounted ? `${arabicFontSize}px` : "36px" }}
                dir="rtl"
                suppressHydrationWarning
              >
                {(() => {
                  if (!isCurrentPlaying) {
                    return ayah.text;
                  }

                  const words = ayah.text.split(" ");
                  const numWords = words.length;
                  // Use 70% of total duration to compensate for breathing pauses at the end, aligning the highlight perfectly to the voice
                  const activeDuration = duration * 0.6;
                  const activeWordIndex = activeDuration > 0
                    ? Math.min(numWords - 1, Math.floor((currentTime / activeDuration) * numWords))
                    : 0;

                  return words.map((word, wIdx) => {
                    const isActiveWord = wIdx === activeWordIndex;
                    return (
                      <span
                        key={wIdx}
                        className={`inline-block transition-all duration-150 ${isActiveWord
                          ? "text-primary font-bold scale-[1.03] drop-shadow-[0_0_1px_rgba(66,128,56,0.4)]"
                          : "text-foreground/70 font-medium"
                          }`}
                      >
                        {word}{" "}
                      </span>
                    );
                  });
                })()}
              </div>

              {/* English Translation */}
              <div className="flex flex-col gap-1 mt-2">
                {/* Source Credit */}
                <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
                  Saheeh International
                </span>
                {/* Translation Text */}
                <p
                  className="text-foreground leading-relaxed text-left"
                  style={{ fontSize: mounted ? `${translationFontSize}px` : "16px" }}
                  suppressHydrationWarning
                >
                  {surah.translation.ayahs[index]?.text || "Translation not available"}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
