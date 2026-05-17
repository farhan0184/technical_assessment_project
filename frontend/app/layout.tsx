import type { Metadata } from "next";
import { Inter, Geist_Mono, Amiri, Scheherazade_New, Lateef } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  weight: ["400", "700"],
  subsets: ["arabic"],
});

const scheherazade = Scheherazade_New({
  variable: "--font-scheherazade",
  weight: ["400", "700"],
  subsets: ["arabic"],
});

const lateef = Lateef({
  variable: "--font-lateef",
  weight: ["400"],
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "Quran Mazid - Read, Study, and Learn The Quran",
  description: "Read, study, and listen to the Holy Quran on Quran Mazid with dynamic font styling, multiple translations, search, and a beautiful custom audio player.",
};

import { SettingsProvider } from "@/components/providers";
import { BottomAudioPlayer } from "@/components/audio-player";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} ${amiri.variable} ${scheherazade.variable} ${lateef.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SettingsProvider>
          {children}
           <BottomAudioPlayer />
        </SettingsProvider>
      </body>
    </html>
  );
}
