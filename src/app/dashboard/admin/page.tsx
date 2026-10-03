import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/db";
import { StatCard } from "@/components/dashboard/stat-card";
import { ClipboardList, Flag, Users, Building2 } from "lucide-react";
import Link from "next/link";


export default async function AdminOverviewPage() {
    await requireRole("ADMIN");

    const [pendingProperties, openReports, totalUsers, totalProperties] = await Promise.all([
        prisma.property.count({where: {status: "PENDING"}}),
        prisma.propertyReport.count({where: {status: "OPEN"}}),
        prisma.user.count(),
        prisma.property.count(),
    ]);

    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
                <p className="text-muted-foreground">Moderation and platform overview.</p>
             </div>

             <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Link href="/dashboard/admin/moderation">
                 <StatCard label="Pending review"  value={pendingProperties}  sublabel="Awaiting approval"  icon={ClipboardList} highlight={pendingProperties > 0}/>
                    </Link>
                    <Link href="/dashboard/admin/reports">
                 <StatCard label="Open reports"  value={openReports}  sublabel="Flagged by users"  icon={Flag} highlight={openReports > 0}/>
                    </Link>
                 <StatCard label="Total users"  value={totalUsers}  sublabel="Student & landlords"  icon={Users} />
                 <StatCard label="Total properties"  value={totalProperties}  sublabel="All statuses"  icon={Building2} />
             </div>


        </div>
    );
}

