"use client";

import { useState, useTransition } from "react";
import { authenticate } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (formData: FormData) => {
        setErrorMessage(undefined);
        startTransition(async () => {
            const result = await authenticate(undefined, formData);
            if (result) {
                setErrorMessage(result);
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            <Card className="w-full max-w-md relative z-10 border-slate-700 bg-slate-900/50 backdrop-blur-xl text-slate-100 shadow-2xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        Hindustan Machinery
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Enter your credentials to access the ERP
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="admin@hm-erp.com"
                                className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        {errorMessage && (
                            <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded border border-red-900/50">
                                {errorMessage}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-blue-900/20 transition-all duration-200"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
