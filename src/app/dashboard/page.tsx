import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/db";
import { StatCard } from "@/components/dashboard/stat-card";
import { Building2, Eye, Heart, Inbox } from "lucide-react";

/*
  Uses requireRole() from Phase 3's session.ts, not a raw auth() check —
  that's the real authorization boundary per CVE-2025-29927. Middleware
  already blocks non-landlords from /dashboard/landlord, but this page
  checks again regardless, same defense-in-depth pattern as every
  protected page since Phase 3.
*/
export default async function LandlordOverviewPage() {
  const user = await requireRole("LANDLORD");

  const [totalProperties, availableProperties, newEnquiries, totalFavourites, totalViews] =
    await Promise.all([
      prisma.property.count({ where: { landlordId: user.id } }),
      prisma.property.count({ where: { landlordId: user.id, isAvailable: true } }),
      prisma.enquiry.count({ where: { landlordId: user.id, status: "NEW" } }),
      prisma.favourite.count({ where: { property: { landlordId: user.id } } }),
      prisma.propertyView.aggregate({
        where: { property: { landlordId: user.id } },
        _sum: { viewCount: true },
      }),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your listings on Clocktower.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Properties listed" value={totalProperties} sublabel={`${availableProperties} available now`} icon={Building2} />
        <StatCard label="New enquiries" value={newEnquiries} sublabel="Awaiting your reply" icon={Inbox} highlight={newEnquiries > 0} />
        <StatCard label="Favourited" value={totalFavourites} sublabel="Across all listings" icon={Heart} />
        <StatCard label="Total views" value={totalViews._sum.viewCount ?? 0} sublabel="Across all listings" icon={Eye} />
      </div>
    </div>
  );
}