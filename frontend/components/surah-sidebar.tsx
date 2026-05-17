"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSurahs, Surah, getSurahSlug } from "@/lib/quran-api";
import { cn } from "@/lib/utils";

// Global cache to persist loaded surahs list across sidebar remounts (route transitions)
let globalCachedSurahs: Surah[] = [];

export function SurahSidebar({ className, onSelect }: { className?: string, onSelect?: () => void }) {
  const pathname = usePathname();
  const [surahs, setSurahs] = useState<Surah[]>(globalCachedSurahs);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(globalCachedSurahs.length === 0);

  useEffect(() => {
    if (globalCachedSurahs.length > 0) {
      return;
    }
    getSurahs().then((data) => {
      globalCachedSurahs = data;
      setSurahs(data);
      setLoading(false);
    });
  }, []);

  const filteredSurahs = surahs.filter(
    (s) =>
      s.englishName.toLowerCase().includes(search.toLowerCase()) ||
      s.englishNameTranslation.toLowerCase().includes(search.toLowerCase()) ||
      s.name.includes(search) ||
      s.number.toString().includes(search)
  );

  return (
    <div className={cn("flex h-full flex-col bg-card border-r", className)}>
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold mb-4 text-foreground">Surahs</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Surah..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col gap-3 p-4">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Loading...</div>
          ) : (
            filteredSurahs.map((surah) => {
              const surahSlug = surah.slug || getSurahSlug(surah.englishName);
              const isActive = pathname === `/${surahSlug}` || pathname === `/${surah.number}` || (pathname === "/" && surah.number === 1);
              return (
                <Link
                  key={surah.number}
                  href={`/${surahSlug}`}
                  onClick={onSelect}
                  className={cn(
                    "flex items-center gap-4 rounded-xl p-4 transition-all duration-200 border",
                    isActive 
                      ? "bg-primary/5 border-primary/20 shadow-sm" 
                      : "bg-transparent border-border/40 hover:bg-accent/40"
                  )}
                >
                  {/* Diamond Icon with Upright Number */}
                  <div className={cn(
                    "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md rotate-45 transition-colors border",
                    isActive 
                      ? "bg-primary border-primary" 
                      : "bg-accent/50 border-border/20"
                  )}>
                    <span className={cn(
                      "text-xs font-semibold -rotate-45 block",
                      isActive ? "text-primary-foreground" : "text-muted-foreground"
                    )}>
                      {surah.number}
                    </span>
                  </div>

                  {/* Transliteration and English Translation */}
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <span className={cn(
                      "font-semibold leading-none mb-1.5 transition-colors text-sm",
                      isActive ? "text-foreground font-bold" : "text-foreground"
                    )}>
                      {surah.englishName.replace(/-/g, ' ')}
                    </span>
                    <span className="text-xs text-muted-foreground leading-none font-medium">
                      {surah.englishNameTranslation}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
