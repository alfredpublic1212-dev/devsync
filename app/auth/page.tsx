"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Github, Chrome } from "lucide-react";

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950">
      <Card className="w-full max-w-sm border-neutral-800 bg-neutral-900 text-neutral-200 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-white">
            Sign in to DevSync
          </CardTitle>
          <CardDescription className="text-neutral-400">
            Collaborate in real-time, directly in your browser
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full gap-2 border-neutral-700 bg-neutral-900 hover:bg-neutral-800"
            onClick={() => signIn("github", { callbackUrl: "/" })}
          >
            <Github className="h-4 w-4" />
            Continue with GitHub
          </Button>

          <Button
            variant="outline"
            className="w-full gap-2 border-neutral-700 bg-neutral-900 hover:bg-neutral-800"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            <Chrome className="h-4 w-4" />
            Continue with Google
          </Button>

          <Separator className="bg-neutral-800" />

          <p className="text-xs text-neutral-500 text-center">
            By continuing, you agree to DevSync’s Terms and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
