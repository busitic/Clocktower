import type { Metadata } from "next";
import { requireRole } from "@/lib/session";
import { getEnquiriesForLandlord } from "@/server/enquiries";
import { EnquiryThread } from "@/components/enquiry/enquiry-thread";
import { EmptyState } from "@/components/shared/empty-state";
import { MessageSquare } from "lucide-react";

export const metadata: Metadata = { title: "Enquiries" };

export default async function LandlordEnquiriesPage() {
  const user = await requireRole("LANDLORD");
  const enquiries = await getEnquiriesForLandlord(user.id);

  // Count of unanswered threads, shown as a badge next to the title
  const newCount = enquiries.filter((e) => e.status === "NEW").length;

  // No <main> here: the dashboard layout already renders one, and
  // nesting two <main> elements is invalid HTML.
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Enquiries</h1>
          <p className="text-muted-foreground">
            {enquiries.length} {enquiries.length === 1 ? "enquiry" : "enquiries"} received
          </p>
        </div>

        {newCount > 0 && (
          <span className="bg-primary/10 text-primary inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-medium">
            <span className="bg-primary size-2 rounded-full" />
            {newCount} awaiting your reply
          </span>
        )}
      </div>

      {enquiries.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No enquiries yet"
          description="When a student contacts you about one of your properties, it shows up here."
        />
      ) : (
        <div className="max-w-4xl space-y-4">
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
    </div>
  );
}