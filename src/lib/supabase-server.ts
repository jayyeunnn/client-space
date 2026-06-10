import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server client — untuk Server Components dan API Routes
// JANGAN import file ini dari Client Components
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component — cookie mutation diabaikan
          }
        },
      },
    }
  );
}
