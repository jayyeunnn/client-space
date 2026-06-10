import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { SettingsClient } from "@/components/dashboard/SettingsClient";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Pengaturan",
};

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, business_name")
    .eq("id", user.id)
    .single();

  return (
    <>
      <Toaster position="top-right" />
      <SettingsClient
        userId={user.id}
        initialFullName={profile?.full_name ?? ""}
        initialBusinessName={profile?.business_name ?? null}
      />
    </>
  );
}
