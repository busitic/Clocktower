import { auth } from "@/lib/auth";
import type { UserRole } from "@prisma/client";

export async function requireUser() {
    const session = await auth();
    if(!session?.user) {
        throw new Error("UNAUTHENTICATED");
    }
    return session.user;
}

export async function RequireRole(...allowedRoles: UserRole[]) {
    const user = await requireUser();
    if(!allowedRoles.includes(user.role)) {
        throw new Error("FORBIDDEN");
    }
    return user;
}