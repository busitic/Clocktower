import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MapPin, Heart, MessageSquare, LayoutDashboard, LogOut,
  Building2, ClipboardList, Flag, Plus,
} from "lucide-react";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold">
          <MapPin className="text-brick size-5" />
          Clocktower
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/properties" className="hover:text-brick transition-colors">
            Find a place
          </Link>
          {user?.role === "LANDLORD" && (
            <Link href="/dashboard/landlord/properties" className="hover:text-brick transition-colors">
              My listings
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <>
              <Link href="/dashboard/admin/moderation" className="hover:text-brick transition-colors">
                Moderation
              </Link>
              <Link href="/dashboard/admin/reports" className="hover:text-brick transition-colors">
                Reports
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {!user && (
            <>
              <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
                Log in
              </Button>
              <Button nativeButton={false} render={<Link href="/register" />}>Sign up</Button>
            </>
          )}

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" className="gap-2 px-2" />}
              >
                <Avatar className="size-7">
                  <AvatarFallback className="text-xs">
                    {user.name?.charAt(0).toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm sm:inline">{user.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user.role === "STUDENT" && (
                  <>
                    <DropdownMenuItem render={<Link href="/dashboard" />}>
                      <LayoutDashboard /> Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/dashboard/favourites" />}>
                      <Heart /> Favourites
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/dashboard/enquiries" />}>
                      <MessageSquare /> My enquiries
                    </DropdownMenuItem>
                  </>
                )}
                {user.role === "LANDLORD" && (
                  <>
                    <DropdownMenuItem render={<Link href="/dashboard/landlord" />}>
                      <LayoutDashboard /> Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/dashboard/landlord/properties" />}>
                      <Building2 /> My listings
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/dashboard/landlord/properties/new" />}>
                      <Plus /> Add property
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/dashboard/landlord/enquiries" />}>
                      <MessageSquare /> Enquiries
                    </DropdownMenuItem>
                  </>
                )}
                {user.role === "ADMIN" && (
                  <>
                    <DropdownMenuItem render={<Link href="/dashboard/admin" />}>
                      <LayoutDashboard /> Admin overview
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/dashboard/admin/moderation" />}>
                      <ClipboardList /> Moderation
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/dashboard/admin/reports" />}>
                      <Flag /> Reports
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <DropdownMenuItem nativeButton render={<button type="submit" className="w-full" />}>
                    <LogOut /> Log out
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}