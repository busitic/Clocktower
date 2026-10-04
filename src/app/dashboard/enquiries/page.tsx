import type { Metadata } from "next";
import { requireRole } from "@/lib/session";
import { getEnquiriesForLandlord, getEnquiriesForStudent } from "@/server/enquiries";
import { EnquiryThread } from "@/components/enquiry/enquiry-thread";
import { EmptyState } from "@/components/shared/empty-state";
import { MessageSquare } from "lucide-react";

export const metadata: Metadata = { title: "Your enquiries" };


export default async function StudentEnquiriesPage() {
    const user = await requireRole("STUDENT");
    const enquiries = await getEnquiriesForStudent(user.id);

    return (
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
     <h1 className="text-2xl font-semibold">
        Your enquiries
     </h1>
     <p className="text-muted-foreground mt-1"> {enquiries.length} {enquiries.length === 1 ? "enquiry" : "enquiries"} sent </p>
      {enquiries.length === 0 ? (
        <div className="mt-8">
          <EmptyState
          icon={MessageSquare}
          title="No enquiries yet"
          description="When you contact a landlord about a property, the conversation shows up here."
          />
        </div>
      ): (
        <div className="mt-6 space-y-4">
        {enquiries.map((enquiry) => (
            <EnquiryThread
            key={enquiry.id}
            currentUserId={user.id}
            canManageStatus={false}
            enquiry={{
                ...enquiry,
                otherPartyName: enquiry.landlord.name,
            }}
            />
        ))}
        </div>
      )}
        </main>
    );
}