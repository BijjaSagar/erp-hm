import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import { authConfig } from "./auth.config";

// Define schema for credentials validation
const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const parsedCredentials = signInSchema.safeParse(credentials);

                if (!parsedCredentials.success) {
                    return null;
                }

                const { email, password } = parsedCredentials.data;

                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user) {
                    return null;
                }

                const isPasswordValid = await compare(password, user.password);

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    branchId: user.branchId,
                    employeeId: user.employeeId,
                };
            },
        }),
    ],
});
