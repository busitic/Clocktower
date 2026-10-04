import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-6 md:flex-row md:gap-10">
        <aside className="md:sticky md:top-24 md:w-56 md:shrink-0 md:self-start">
          <DashboardNav role={session.user.role} />
        </aside>
        {/* min-w-0 stops wide children (tables, long text) from stretching the page sideways */}
        <main className="animate-in fade-in min-w-0 flex-1 duration-500">{children}</main>
      </div>
    </div>
  );
}