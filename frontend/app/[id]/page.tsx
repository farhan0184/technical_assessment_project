import { getSurahs, getSurahDetail, SurahDetail } from "@/lib/quran-api";
import { AyahList } from "@/components/ayah-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const surah = await getSurahDetail(id);
    const surahName = surah.englishName.replace(/-/g, ' ');
    return {
      title: `Surah ${surahName} (${surah.englishNameTranslation}) - Quran Mazid`,
      description: `Read, study, and listen to Surah ${surahName} (${surah.englishNameTranslation}) containing ${surah.numberOfAyahs} verses. Access high-quality Arabic audio recitation, English translations, and study aids on Quran Mazid.`,
      openGraph: {
        title: `Surah ${surahName} (${surah.englishNameTranslation}) - Quran Mazid`,
        description: `Read, study, and listen to Surah ${surahName} (${surah.englishNameTranslation}) containing ${surah.numberOfAyahs} verses with high-quality audio recitation and translations.`,
        type: "website",
      },
    };
  } catch (e) {
    return {
      title: "Surah Reader - Quran Mazid",
      description: "Read, study, and listen to the Holy Quran on Quran Mazid.",
    };
  }
}


export async function generateStaticParams() {
  const surahs = await getSurahs();
  return surahs.map((surah) => ({
    id: surah.slug,
  }));
}

export default async function SurahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let surah: SurahDetail | undefined;
  let prevSlug: string | null = null;
  let nextSlug: string | null = null;
  let error: string | null = null;
  
  try {
    surah = await getSurahDetail(id);
    const surahs = await getSurahs();
    const currentIndex = surahs.findIndex(s => s.number === surah?.number);
    if (currentIndex !== -1) {
      const prevSurah = currentIndex > 0 ? surahs[currentIndex - 1] : null;
      const nextSurah = currentIndex < surahs.length - 1 ? surahs[currentIndex + 1] : null;
      prevSlug = prevSurah ? prevSurah.slug : null;
      nextSlug = nextSurah ? nextSurah.slug : null;
    }
  } catch (e) {
    error = "Failed to load surah content. Please check your internet connection and try again.";
  }

  return (
    <main className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="">
          {error ? (
            <div className="flex h-[50vh] flex-col items-center justify-center text-center p-10">
              <h2 className="text-2xl font-bold mb-4">Error</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <a href={`/${id}`}>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
                  Try Again
                </button>
              </a>
            </div>
          ) : (
            surah && <AyahList surah={surah} prevSlug={prevSlug} nextSlug={nextSlug} />
          )}
        </div>
      </ScrollArea>
    </main>
  );
}