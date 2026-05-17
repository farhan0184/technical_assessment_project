"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { IconSidebar } from "@/components/icon-sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, Bookmark, BookOpen, MoreHorizontal } from "lucide-react";
import { useSettings } from "@/components/providers";
import { getCumulativeAyahNumber, getSurahSlug, SurahDetail } from "@/lib/quran-api";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const {
    arabicFont,
    arabicFontSize,
    translationFontSize,
    playingSurah,
    isPlaying,
    playAyah,
  } = useSettings();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch(`https://quern-cloud.vercel.app/api/surahs/search?translation=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        setResults((data && data.data && data.data.verses) || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Search error:", err);
        setLoading(false);
      });
  }, [query]);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          Search Results
        </h1>
        <p className="text-sm text-muted-foreground font-medium">
          Found {results.length} results for &ldquo;{query}&rdquo;
        </p>
      </div>
      
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center text-muted-foreground font-medium animate-pulse">
          Searching...
        </div>
      ) : results.length === 0 ? (
        <div className="flex h-[40vh] items-center justify-center text-muted-foreground font-medium">
          No results found.
        </div>
      ) : (
        <div className="flex flex-col gap-6 py-6 border rounded-2xl bg-card shadow-sm divide-y divide-border/50">
          {results.map((verse: any) => {
            const cumulativeNumber = getCumulativeAyahNumber(verse.surah_number, verse.verse_number);
            const surahSlug = getSurahSlug(verse.transliteration);
            
            const dummySurah: SurahDetail = {
              number: verse.surah_number,
              name: verse.surah_name,
              englishName: verse.transliteration,
              englishNameTranslation: verse.surah_name,
              numberOfAyahs: 1,
              revelationType: verse.type,
              slug: surahSlug,
              ayahs: [
                {
                  number: cumulativeNumber,
                  audio: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${cumulativeNumber}.mp3`,
                  audioSecondary: [],
                  text: verse.verse,
                  numberInSurah: verse.verse_number,
                  juz: 1,
                  manzil: 1,
                  page: 1,
                  ruku: 1,
                  hizbQuarter: 1,
                  sajda: false,
                }
              ],
              translation: {
                ayahs: [
                  {
                    text: verse.translation,
                    numberInSurah: verse.verse_number,
                  }
                ]
              }
            };

            const isCurrentPlaying = playingSurah?.number === verse.surah_number && playingSurah?.ayahs[0]?.number === cumulativeNumber && isPlaying;

            return (
              <div
                key={`${verse.surah_number}:${verse.verse_number}`}
                className="flex gap-8 py-8 group px-8 scroll-mt-20 md:scroll-mt-24 first:pt-6 last:pb-6"
              >
                {/* Left Control Column */}
                <div className="flex flex-col items-center gap-5 w-12 shrink-0 select-none">
                  {/* Ayah Key (e.g. 2:1) */}
                  <span className="text-primary font-bold text-lg tracking-wide">
                    {verse.surah_number}:{verse.verse_number}
                  </span>

                  {/* Play Button */}
                  <button
                    onClick={() => playAyah(dummySurah, 0)}
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

                  {/* More Actions Button */}
                  <button
                    className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                    title="More Options"
                  >
                    <MoreHorizontal className="h-5 w-5 stroke-[1.5]" />
                  </button>
                </div>

                {/* Right Content Column */}
                <div className="flex-1 flex flex-col gap-4">
                  {/* Context Header: Surah Details */}
                  <div className="flex flex-col gap-1 text-left select-none">
                    <span className="text-xs font-bold text-primary tracking-wider uppercase">
                      Surah {verse.transliteration} ({verse.surah_name}) • Ayah {verse.verse_number}
                    </span>
                  </div>

                  {/* Arabic Text (Right Aligned) */}
                  <div
                    className={`text-right leading-loose transition-all duration-300 ${mounted ? arabicFont : "font-scheherazade"}`}
                    style={{ fontSize: mounted ? `${arabicFontSize}px` : "36px" }}
                    dir="rtl"
                    suppressHydrationWarning
                  >
                    {verse.verse}
                  </div>

                  {/* English Translation */}
                  <div className="flex flex-col gap-1 mt-2 text-left">
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
                      {verse.translation}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="flex h-screen bg-background">
      <IconSidebar />
      <div className="flex flex-1 flex-col lg:pl-16">
        <Header />
        <main className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <Suspense fallback={<div className="p-10 text-center text-muted-foreground">Loading...</div>}>
              <SearchContent />
            </Suspense>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}
