import type { Metadata } from "next";
import { requireRole } from "@/lib/session";
import { getEnquiriesForLandlord } from "@/server/enquiries";
import { EnquiryThread } from "@/components/enquiry/enquiry-thread";
import { EmptyState } from "@/components/shared/empty-state";
import { MessageSquare } from "lucide-react";

export const metadata: Metadata = { title: "Enquiries" };


export default async function LandloardEnquiries() {
    const user = await requireRole("LANDLORD");
    const enquiries = await getEnquiriesForLandlord(user.id);

    return (
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
             <h1 className="text-2xl font-semibold">
              Enquiries
             </h1>
             <p className="text-muted-foreground">
                  {enquiries.length}  {enquiries.length === 1 ? "enquiry" : "enquiries"} received
             </p>

             {enquiries.length === 0 ? (
                <div className="mt-8">
                <EmptyState
                icon={MessageSquare}
                title="No enquiries yet"
                description="When a student contacts you about one of your properties, it shows up here."
                />
                </div>
             ) : (
                <div className="mt-6 space-y-4">
                    {enquiries.map((enquiry) => (
                        <EnquiryThread
                        key={enquiry.id}
                        currentUserId={user.id}
                        canManageStatus
                        enquiry={{
                            ...enquiry,
                            otherPartyName: enquiry.student.name,
                        }}
                        />
                    ))}
                </div>
             )}
        </main>
    )
}