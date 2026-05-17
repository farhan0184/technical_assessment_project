"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Custom Rihal book stand logo icon
const LogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Left page */}
    <path d="M12 5c-3-1.5-6.5-1.5-9.5 0v9.5c3-1.5 6.5-1.5 9.5 0Z" fill="currentColor" fillOpacity="0.15" />
    {/* Right page */}
    <path d="M12 5c3-1.5 6.5-1.5 9.5 0v9.5c-3-1.5-6.5-1.5-9.5 0Z" fill="currentColor" fillOpacity="0.3" />
    {/* Center line */}
    <line x1="12" y1="5" x2="12" y2="14.5" />
    {/* Rihal Stand crossed legs */}
    <path d="M7 16.5l5 2.5 5-2.5" />
    <path d="M9 18l-2 2" />
    <path d="M15 18l2 2" />
  </svg>
);

// Icon 1: Custom Home Pentagon outline with circle center
const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M5 20V11l7-6 7 6v9z" />
    <circle cx="12" cy="14" r="1.5" />
  </svg>
);

// Icon 2: Custom 4-dot Grid with dual opacities
const GridIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <rect x="5" y="5" width="6" height="6" rx="1.5" className="opacity-80" />
    <rect x="13" y="5" width="6" height="6" rx="1.5" className="opacity-30" />
    <rect x="5" y="13" width="6" height="6" rx="1.5" className="opacity-30" />
    <rect x="13" y="13" width="6" height="6" rx="1.5" className="opacity-80" />
  </svg>
);

// Icon 3: Custom Send/Paper Airplane outline
const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4Z" />
  </svg>
);

// Icon 4: Custom Bookmark ribbon outline
const BookmarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

// Icon 5: Custom Dashboard outline
const LayoutDashboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="14" y="4" width="6" height="6" rx="1.5" />
    <rect x="4" y="14" width="6" height="6" rx="1.5" />
    <line x1="14" y1="15" x2="20" y2="15" />
    <line x1="14" y1="19" x2="18" y2="19" />
  </svg>
);

export function IconSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 hidden h-full w-16 flex-col items-center border-r bg-sidebar py-6 lg:flex z-50">
      {/* Top Green Rihal Logo */}
      <div className="mb-2">
        <Link href="/">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm hover:opacity-90 transition-opacity">
            <LogoIcon className="h-6 w-6 text-primary-foreground" />
          </div>
        </Link>
      </div>

      {/* Nav List */}
      <nav className="flex flex-1 flex-col justify-center gap-7">
        <NavItem 
          icon={<HomeIcon className="h-7 w-7" />} 
          label="Home" 
          href="/" 
          isActive={pathname === "/" || (!pathname.startsWith("/search") && pathname !== "/bookmarks" && pathname !== "/dashboard")} 
        />
        <NavItem 
          icon={<GridIcon className="h-7 w-7" />} 
          label="Explore" 
          href="/" 
          isActive={false} 
        />
        <NavItem 
          icon={<SendIcon className="h-7 w-7" />} 
          label="Search" 
          href="/search" 
          isActive={pathname.startsWith("/search")} 
        />
        <NavItem 
          icon={<BookmarkIcon className="h-7 w-7" />} 
          label="Bookmarks" 
          href="#" 
          isActive={pathname === "/bookmarks"} 
        />
        <NavItem 
          icon={<LayoutDashboardIcon className="h-7 w-7" />} 
          label="Dashboard" 
          href="#" 
          isActive={pathname === "/dashboard"} 
        />
      </nav>
    </aside>
  );
}

function NavItem({ 
  icon, 
  label, 
  href, 
  isActive 
}: { 
  icon: React.ReactNode; 
  label: string; 
  href: string; 
  isActive: boolean;
}) {
  return (
    <Link href={href} className="group">
      <div 
        className={cn(
          "h-11 w-11 flex items-center justify-center rounded-xl transition-all duration-200 text-[#5a6e5f] dark:text-[#8a9f8f] cursor-pointer",
          isActive 
            ? "text-primary bg-primary/10" 
            : "hover:text-primary hover:bg-primary/5"
        )} 
        title={label}
      >
        {icon}
        <span className="sr-only">{label}</span>
      </div>
    </Link>
  );
}