"use client";

import { Menu, Settings, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSettings } from "@/components/providers";
import { cn } from "@/lib/utils";
import { SurahSidebar } from "./surah-sidebar";

const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const HalfCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 1 0 20Z" fill="currentColor" />
  </svg>
);

const DoubleHeartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    <path d="M19 13.5c0-.8-.6-1.4-1.4-1.4-.4 0-.8.2-1 .5-.2-.3-.6-.5-1-.5-.8 0-1.4.6-1.4 1.4 0 1.1 1 2 2.4 3.2l.2.2.2-.2c1.4-1.2 2.4-2.1 2.4-3.2z" className="text-white/80" />
  </svg>
);

const HEADER_HEIGHT = 80;

export function Header() {
  const router = useRouter();
  const { theme, setTheme, activeAyahIndex } = useSettings();
  const [openSurah, setOpenSurah] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [visible, setVisible] = useState(true);

  const themeMenuRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const isAutoScrollingRef = useRef(false);
  const rafId = useRef<number | null>(null);
  const isHidden = useRef(false);
  // We track WHICH element is the main scroll container so inner
  // Radix divs don't interfere — set once on first significant scroll.
  const scrollContainer = useRef<EventTarget | null>(null);

  useEffect(() => {
    if (activeAyahIndex !== null) {
      isAutoScrollingRef.current = true;
      const t = setTimeout(() => { isAutoScrollingRef.current = false; }, 1000);
      return () => clearTimeout(t);
    }
  }, [activeAyahIndex]);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      if (isAutoScrollingRef.current) return;

      const target = e.target as HTMLElement | Document;

      // ── Identify the main scroll container on first scroll ──
      // The main container is whichever element scrolls most (tallest scrollHeight).
      // We lock onto it and ignore all other elements after that.
      if (!scrollContainer.current) {
        scrollContainer.current = target;
      } else if (target !== scrollContainer.current) {
        // A different element scrolled — could be a bigger container we missed.
        // Upgrade if this one has more scrollable content.
        const cur = scrollContainer.current as HTMLElement;
        const el = target as HTMLElement;
        const curHeight = cur === (document as any) ? document.documentElement.scrollHeight : cur.scrollHeight;
        const elHeight = el.scrollHeight ?? 0;
        if (elHeight > curHeight) {
          scrollContainer.current = target;
        } else {
          // Ignore — it's an inner div (Radix ScrollArea, dropdown, etc.)
          return;
        }
      }

      if (rafId.current !== null) return;
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;

        const el = scrollContainer.current;
        let scrollY = 0;
        let scrollHeight = 0;
        let clientHeight = 0;

        if (!el || el === document || el === window) {
          scrollY = window.scrollY || document.documentElement.scrollTop;
          scrollHeight = document.documentElement.scrollHeight;
          clientHeight = window.innerHeight;
        } else {
          const div = el as HTMLElement;
          scrollY = div.scrollTop;
          scrollHeight = div.scrollHeight;
          clientHeight = div.clientHeight;
        }

        // Freeze zone: within one header-height of the bottom.
        // Toggling here would change scrollHeight → trigger more events → vibrate.
        const distToBottom = scrollHeight - scrollY - clientHeight;
        if (distToBottom < HEADER_HEIGHT) {
          lastScrollY.current = scrollY;
          return;
        }

        const delta = scrollY - lastScrollY.current;
        const MIN_DELTA = 4;

        if (delta > MIN_DELTA && scrollY > HEADER_HEIGHT && !isHidden.current) {
          isHidden.current = true;
          setVisible(false);
        } else if (delta < -MIN_DELTA && isHidden.current) {
          isHidden.current = false;
          setVisible(true);
        }

        lastScrollY.current = scrollY;
      });
    };

    // Capture phase so we hear inner container scrolls too,
    // but we filter to only act on the main one.
    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  useEffect(() => {
    if ((openSurah || openSettings) && isHidden.current) {
      isHidden.current = false;
      setVisible(true);
    }
  }, [openSurah, openSettings]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ease-in-out overflow-hidden",
      visible
        ? "h-20 py-3 opacity-100 border-b pointer-events-auto"
        : "h-0 py-0 opacity-0 border-b-0 pointer-events-none"
    )}>
      <div className="relative flex h-14 items-center justify-between px-4 lg:px-8">

        {/* Left: Branding */}
        <div className="flex items-center gap-2">
          <Sheet open={openSurah} onOpenChange={setOpenSurah}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden mr-1 h-9 w-9 rounded-full bg-primary/5 text-primary hover:bg-primary/10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Surahs</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[300px]">
              <SheetHeader className="sr-only">
                <SheetTitle>Surah List</SheetTitle>
                <SheetDescription>Browse and select a surah from the Quran.</SheetDescription>
              </SheetHeader>
             {/* Surah List Content */}
             <SurahSidebar onSelect={() => setOpenSurah(false)} />
            </SheetContent>
          </Sheet>

          <Link href="/" className="hidden md:flex flex-col hover:opacity-90 transition-opacity">
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-[#1a331e] dark:text-foreground leading-tight">
              Quran Mazid
            </h1>
            <p className="text-[10px] lg:text-[11px] font-medium text-[#5a6e5f] dark:text-[#8a9f8f] tracking-wide mt-0.5">
              Read, Study, and Learn The Quran
            </p>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">

          {/* Search */}
          <div className={cn(
            "flex items-center transition-all duration-200",
            showSearchInput
              ? "absolute inset-x-4 top-1/2 -translate-y-1/2 md:relative md:inset-auto md:translate-y-0 z-50 bg-background md:bg-transparent h-11 md:h-auto px-3 md:px-0 rounded-full border border-primary/10 dark:border-primary/20 md:border-0 shadow-sm md:shadow-none"
              : "relative"
          )}>
            {showSearchInput ? (
              <form
                className="flex-1 flex items-center gap-2 animate-in slide-in-from-right duration-200"
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = new FormData(e.currentTarget).get("q");
                  if (q) router.push(`/search?q=${q}`);
                  setShowSearchInput(false);
                }}
              >
                <Input
                  name="q"
                  type="search"
                  placeholder="Search ayah..."
                  className="w-full md:w-40 lg:w-48 bg-primary/5 border-primary/20 focus-visible:ring-primary h-9 rounded-full px-4 text-sm"
                  autoFocus
                  onBlur={() => setTimeout(() => setShowSearchInput(false), 200)}
                />
                <button
                  type="button"
                  onClick={() => setShowSearchInput(false)}
                  className="md:hidden flex h-8 items-center justify-center rounded-full px-3 text-xs font-semibold text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowSearchInput(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 dark:bg-primary/10 text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                title="Search"
              >
                <Search className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Theme */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setShowThemeMenu(v => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 dark:bg-primary/10 text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
              title="Change Theme"
            >
              <HalfCircleIcon className="h-5 w-5" />
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-40 origin-top-right rounded-2xl border bg-card p-1.5 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in duration-100">
                <div className="flex flex-col gap-0.5">
                  <ThemeOption icon={<SunIcon className="h-4.5 w-4.5" />} label="Light" active={theme === "light"} onClick={() => { setTheme("light"); setShowThemeMenu(false); }} />
                  <ThemeOption icon={<MoonIcon className="h-4.5 w-4.5" />} label="Dark" active={theme === "dark"} onClick={() => { setTheme("dark"); setShowThemeMenu(false); }} />
                  <ThemeOption icon={<HalfCircleIcon className="h-4.5 w-4.5" />} label="System" active={theme === "system"} onClick={() => { setTheme("system"); setShowThemeMenu(false); }} />
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button
            onClick={() => setOpenSettings(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 dark:bg-primary/10 text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>

          <Sheet open={openSettings} onOpenChange={setOpenSettings}>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
                <SheetDescription>Adjust appearance and font settings.</SheetDescription>
              </SheetHeader>
              {/* settings content */}
            </SheetContent>
          </Sheet>

          {/* Support Us */}
          <Link
            href="#"
            className="hidden md:inline-flex h-10 items-center gap-2 rounded-full bg-primary hover:bg-primary/90 px-5 text-sm font-semibold text-primary-foreground transition-all shadow-sm active:scale-95"
          >
            <span>Support Us</span>
            <DoubleHeartIcon className="h-4.5 w-4.5 text-primary-foreground/90" />
          </Link>

        </div>
      </div>
    </header>
  );
}

function ThemeOption({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition-all duration-150",
        active ? "bg-primary/10 text-primary dark:bg-primary/20" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <span className="flex h-5 w-5 items-center justify-center">{icon}</span>
      <span>{label}</span>
    </button>
  );
}