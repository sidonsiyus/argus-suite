import React, { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Mentor Access · MENTOR OS",
  description: "Institutional mentor authentication portal for MENTOR OS",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-workspace flex flex-col items-center justify-center p-6 sm:p-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-800" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
