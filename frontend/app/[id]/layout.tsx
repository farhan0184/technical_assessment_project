
import { Header } from "@/components/header";
import { IconSidebar } from "@/components/icon-sidebar";
import { SurahSidebar } from "@/components/surah-sidebar";

export default function SurahLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <IconSidebar />
      <div className="flex flex-1 flex-col lg:pl-16">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Surah Sidebar (Persisted in layout so it never re-mounts) */}
          <aside className="hidden w-[350px] border-r bg-card lg:block h-full">
            <SurahSidebar />
          </aside>
          {children}
        </div>
      </div>
    </div>
  );
}
