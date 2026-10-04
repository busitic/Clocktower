"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Heart, MessageSquare, Building2, Plus, ClipboardList, Flag,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "STUDENT" | "LANDLORD" | "ADMIN";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// One list per role. Defined here (not passed from the server layout)
// because icon components can't be sent from a Server Component to a
// Client Component as props.
const NAV_ITEMS: Record<Role, NavItem[]> = {
  STUDENT: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/favourites", label: "Favourites", icon: Heart },
    { href: "/dashboard/enquiries", label: "My enquiries", icon: MessageSquare },
  ],
  LANDLORD: [
    { href: "/dashboard/landlord", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/landlord/properties", label: "My listings", icon: Building2 },
    { href: "/dashboard/landlord/properties/new", label: "Add property", icon: Plus },
    { href: "/dashboard/landlord/enquiries", label: "Enquiries", icon: MessageSquare },
  ],
  ADMIN: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/moderation", label: "Moderation", icon: ClipboardList },
    { href: "/dashboard/admin/reports", label: "Reports", icon: Flag },
  ],
};

export function DashboardNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role];

  // Highlight only the LONGEST matching link. Without this, visiting
  // /properties/new would light up both "My listings" and "Add property",
  // because the first path is a prefix of the second.
  const activeHref = items
    .filter((i) => pathname === i.href || pathname.startsWith(i.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav
      aria-label="Dashboard"
      // Mobile: one horizontally scrollable row. Desktop: vertical sidebar.
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-col md:gap-1 md:overflow-visible md:px-0 md:pb-0"
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === activeHref;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? "bg-brick/10 text-brick"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}