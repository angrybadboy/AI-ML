import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { GGNav } from "@/components/shared/GGNav";
import { FadeInOnRouteChange } from "@/components/motion/FadeInOnRouteChange";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    // middleware가 1차 방어선이지만 이중 안전.
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", user.id)
    .maybeSingle();

  const avatarLetter = profile?.nickname?.[0] ?? user.email?.[0]?.toUpperCase();

  return (
    <div className="skin grain" style={{ minHeight: "100dvh" }}>
      <GGNav avatarLetter={avatarLetter} />
      <FadeInOnRouteChange>{children}</FadeInOnRouteChange>
    </div>
  );
}
