import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/db";
import { StatCard } from "@/components/dashboard/stat-card";
import { Heart, MessageSquare, Eye } from "lucide-react";

export default async function StudentDashboardPage() {
  const user = await requireRole("STUDENT");

  const [totalFavourites, totalEnquiries, totalViews] = await Promise.all([
    prisma.favourite.count({ where: { userId: user.id } }),
    prisma.enquiry.count({ where: { studentId: user.id } }),
    prisma.propertyView.count({ where: { userId: user.id } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your activity on Clocktower.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Favourited"
          value={totalFavourites}
          sublabel="Properties you've saved"
          icon={Heart}
          href="/dashboard/favourites"
        />
        <StatCard
          label="Enquiries sent"
          value={totalEnquiries}
          sublabel="Messages to landlords"
          icon={MessageSquare}
          href="/dashboard/enquiries"
        />
        <StatCard
          label="Properties viewed"
          value={totalViews}
          sublabel="Listings you've opened"
          icon={Eye}
        />
      </div>
    </div>
  );
}