"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TestRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/start");
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <p className="text-[var(--muted-foreground)]">Redirigiendo...</p>
      </div>
    </main>
  );
}
