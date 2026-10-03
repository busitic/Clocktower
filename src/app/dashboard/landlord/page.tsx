import { auth } from "@/lib/auth";
import  { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/dashboard/stat-card";
import { Building2, Eye, Heart, Inbox } from "lucide-react";


export default async function LandlordOverviewPage() {
    const session = await auth();


    if (!session?.user || session.user.role !== "LANDLORD") {
        redirect("/dashboard");
    }


    const landlordId = session.user.id;

    const [totalProperties, availableProperties, newEnquiries, totalFavourites, totalViews] = 
    await Promise.all([
        prisma.property.count({where: {landlordId} }),
        prisma.property.count({where: {landlordId, isAvailable: true} }),
        prisma.enquiry.count({where: {landlordId, status: "NEW"} }),
        prisma.favourite.count({where:{property:  {landlordId,} } }),

        prisma.propertyView.aggregate({
            where: {property: {landlordId}},
            _sum: {viewCount: true},
        }),
    ]);

    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Dashboard
                </h1>
                <p className="text-muted-foreground">
                    Overview of your listings on Clocktower.
                </p>
             </div>

             <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                label= "Properties listed"
                value={totalProperties}
                sublabel={`${availableProperties} available now `}
                icon={Building2}
                />
                <StatCard
                label= "New enquiries"
                value={newEnquiries}
                sublabel="Awaiting your reply"
                icon={Inbox}
                highlight={newEnquiries > 0}
                />
                <StatCard
                label= "Favourited"
                value={totalFavourites}
                sublabel="Across all listings"
                icon={Heart}
                />
                <StatCard
                label= "Total views"
                value={totalViews._sum.viewCount ?? 0}
                 sublabel="Across all listings"
                icon={Eye}
                />   
             </div>
        </div>
    );
}