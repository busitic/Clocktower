import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/db";
import { PropertyCard } from "@/components/property/property-card";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageSquare, Clock } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

export default async function StudentDashboardPage() {
  const user = await requireRole("STUDENT");

  const [favouriteCount, enquiryCount, recentViews] = await Promise.all([
    prisma.favourite.count({ where: { userId: user.id } }),
    prisma.enquiry.count({ where: { studentId: user.id } }),
    prisma.propertyView.findMany({
      where: { userId: user.id },
      orderBy: { viewedAt: "desc" },
      take: 3,
      include: { property: { include: { images: { take: 1, orderBy: { position: "asc" } }, amenities: true } } },
    }),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold">Welcome back, {user.name?.split(" ")[0]}</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard/favourites">
          <Card className="hover:border-brick transition-colors">
            <CardContent className="flex items-center gap-4 pt-6">
              <Heart className="text-brick size-8" />
              <div>
                <p className="text-2xl font-semibold">{favouriteCount}</p>
                <p className="text-muted-foreground text-sm">Saved favourites</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/enquiries">
          <Card className="hover:border-brick transition-colors">
            <CardContent className="flex items-center gap-4 pt-6">
              <MessageSquare className="text-brick size-8" />
              <div>
                <p className="text-2xl font-semibold">{enquiryCount}</p>
                <p className="text-muted-foreground text-sm">Enquiries sent</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {recentViews.length > 0 && (
        <div className="mt-10">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Clock className="size-5" /> Recently viewed
          </h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {recentViews.map((view) => (
              <PropertyCard key={view.id} property={view.property} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}