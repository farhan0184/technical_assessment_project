export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  slug: string;
}

export interface Ayah {
  number: number;
  audio: string;
  audioSecondary: string[];
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

export interface SurahDetail extends Surah {
  ayahs: Ayah[];
  translation: {
    ayahs: {
      text: string;
      numberInSurah: number;
    }[];
  };
}

const API_BASE = "https://quern-cloud.vercel.app/api";

const ARABIC_NAMES = [
  "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
  "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه",
  "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم",
  "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر",
  "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق",
  "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة",
  "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج",
  "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس",
  "التكوير", "الإنفطار", "المطففين", "الإنشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد",
  "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات",
  "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر",
  "المسد", "الإخلاص", "الفلق", "الناس"
];

const surahVerseCounts = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 
  123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 
  34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 
  54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 
  60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 
  14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 
  28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 
  29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 
  15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 
  11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 
  5, 4, 5, 6
];

export function getCumulativeAyahNumber(surahNumber: number, verseNumber: number): number {
  let count = 0;
  for (let i = 0; i < surahNumber - 1; i++) {
    count += surahVerseCounts[i];
  }
  return count + verseNumber;
}

async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) return res;
      
      if (res.status === 429) { // Rate limit
        await new Promise(r => setTimeout(r, delay * (i + 1) * 2));
        continue;
      }
    } catch (err: any) {
      if (i === retries - 1) throw err;
      const waitTime = err.name === 'AbortError' ? 500 : delay * (i + 1);
      await new Promise(r => setTimeout(r, waitTime));
    }
  }
  throw new Error(`Failed to fetch ${url} after ${retries} retries`);
}

export function getSurahSlug(englishName: string): string {
  return englishName
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function getSurahIdBySlug(slugOrId: string | number): Promise<number> {
  const num = typeof slugOrId === "number" ? slugOrId : parseInt(slugOrId);
  if (!isNaN(num)) {
    return num;
  }
  
  // Look up by slug
  const surahs = await getSurahs();
  const found = surahs.find(s => getSurahSlug(s.englishName) === slugOrId.toString().toLowerCase());
  return found ? found.number : 1;
}

export async function getSurahs(): Promise<Surah[]> {
  const res = await fetchWithRetry(`${API_BASE}/surahs`);
  const data = await res.json();
  if (!data.success || !Array.isArray(data.data)) {
    throw new Error("Invalid response format from surahs API");
  }
  return data.data.map((surah: any) => {
    const slug = getSurahSlug(surah.transliteration);
    return {
      number: surah.surah_number,
      name: ARABIC_NAMES[surah.surah_number - 1] || "",
      englishName: surah.transliteration,
      englishNameTranslation: surah.surah_name,
      numberOfAyahs: surahVerseCounts[surah.surah_number - 1] || 0,
      revelationType: surah.type,
      slug
    };
  });
}

export async function getSurahDetail(surahNumberOrSlug: number | string): Promise<SurahDetail> {
  try {
    const surahNumber = typeof surahNumberOrSlug === "number" 
      ? surahNumberOrSlug 
      : await getSurahIdBySlug(surahNumberOrSlug);

    const res = await fetchWithRetry(`${API_BASE}/surahs/${surahNumber}`);
    const data = await res.json();

    if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
      console.error(`Incomplete data for surah ${surahNumber}`, data);
      throw new Error(`Incomplete data for surah ${surahNumber}`);
    }

    const first = data.data[0];

    const mappedAyahs: Ayah[] = data.data.map((item: any) => {
      const cumulativeNumber = getCumulativeAyahNumber(surahNumber, item.verse_number);
      return {
        number: cumulativeNumber,
        audio: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${cumulativeNumber}.mp3`,
        audioSecondary: [],
        text: item.verse,
        numberInSurah: item.verse_number,
        juz: 1,
        manzil: 1,
        page: 1,
        ruku: 1,
        hizbQuarter: 1,
        sajda: false,
      };
    });

    const translationAyahs = data.data.map((item: any) => ({
      text: item.translation,
      numberInSurah: item.verse_number,
    }));

    const slug = getSurahSlug(first.transliteration);

    return {
      number: first.surah_number,
      name: ARABIC_NAMES[first.surah_number - 1] || "",
      englishName: first.transliteration,
      englishNameTranslation: first.surah_name,
      numberOfAyahs: data.data.length,
      revelationType: first.type,
      slug,
      ayahs: mappedAyahs,
      translation: {
        ayahs: translationAyahs,
      },
    };
  } catch (error) {
    console.error(`Error in getSurahDetail(${surahNumberOrSlug}):`, error);
    throw error;
  }
}
