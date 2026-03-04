import type { NextAuthConfig } from "next-auth";
import { Role } from "@prisma/client";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role as Role;
                token.branchId = user.branchId as string | null;
                // @ts-ignore
                token.employeeId = user.employeeId as string | null;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as Role;
                session.user.branchId = token.branchId as string | null;
                // @ts-ignore
                session.user.employeeId = token.employeeId as string | null;
            }
            return session;
        },
        async authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnLogin = nextUrl.pathname.startsWith('/login');

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn && isOnLogin) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
    },
    providers: [], // We'll add the providers in auth.ts
    trustHost: true,
    session: {
        strategy: "jwt",
    },
} satisfies NextAuthConfig;
