"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className={
        className ??
        "text-white/40 hover:text-white text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.06]"
      }
    >
      Sign out
    </button>
  );
}