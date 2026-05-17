import { Header } from "@/components/header.";
import { IconSidebar } from "@/components/icon-sidebar";

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
          {children}
        </div>
      </div>
    </div>
  );
}