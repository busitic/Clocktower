import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ReportRowActions } from "@/components/dashboard/report-row-actions";

const REASON_LABELS: Record<string, string> = {
  MISLEADING: "Misleading listing",
  UNAVAILABLE: "No longer available",
  INAPPROPRIATE: "Inappropriate content",
  SUSPECTED_SCAM: "Suspected scam",
  DUPLICATE: "Duplicate listing",
  OTHER: "Other",
};

export default async function ReportsPage() {
  await requireRole("ADMIN");

  const reports = await prisma.propertyReport.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "asc" },
    include: {
      property: { select: { title: true, slug: true } },
      reporter: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">{reports.length} open report{reports.length !== 1 && "s"}</p>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          No open reports.
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={`/properties/${report.property.slug}`} target="_blank" className="font-medium hover:underline">
                    {report.property.title}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    {REASON_LABELS[report.reason]} · reported by {report.reporter.name} ({report.reporter.email})
                  </p>
                  {report.details && (
                    <p className="text-sm mt-2 border-l-2 pl-3 text-muted-foreground">{report.details}</p>
                  )}
                </div>
                <ReportRowActions reportId={report.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}