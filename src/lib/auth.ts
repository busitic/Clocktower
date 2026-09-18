import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";
import type { UserRole } from "@prisma/client";

export const {handlers, auth, signIn, signOut} = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: {strategy: "jwt"},
    pages: {
        signIn: "/login",
    },

    providers: [
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            async authorize(credentials) {
                const parsed = loginSchema.safeParse(credentials);
                if(!parsed.success) return null;

                const {email, password} = parsed.data;
                const user = await prisma.user.findUnique({
                    where: {email: email.toLowerCase()},
                });

                if (!user || !user.passwordHash) return null;

                if (user.isSuspended) return null;
                
                const passwordsMatch = await bcrypt.compare(
                    password,
                    user.passwordHash, 
                );
                if(!passwordsMatch) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.image,

                };
            },
        }),
    ],
    callbacks: {
        async jwt({token, user}) {
            if (user) {
                token.id = user.id;
                token.role = (user as {role: UserRole}).role;
            }
            return token;
        },

        async session({session, token}) {
            if (session.user){
                session.user.id = token.id as string;
                session.user.role = token.role as UserRole;
            }
            return session;
        },
    },
});