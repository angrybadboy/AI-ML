import { notFound, redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { UserPostView } from "@/components/quote/UserPostView";

export const dynamic = "force-dynamic";

export default async function UserPostPage({
  params,
}: {
  params: Promise<{ no: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { no } = await params;
  const serial = Number.parseInt(no, 10);
  if (!Number.isFinite(serial) || serial <= 0) notFound();

  const supabase = await createClient();

  // RLS가 visibility=private 인 타인 글을 자동으로 가린다 (TRD §3.3)
  const { data: post } = await supabase
    .from("user_posts")
    .select("*")
    .eq("serial_no", serial)
    .maybeSingle();

  if (!post) notFound();

  const [profileRes, savedRes, readsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("nickname")
      .eq("id", post.user_id)
      .maybeSingle(),
    supabase
      .from("saved_items")
      .select("id")
      .eq("user_id", user.id)
      .eq("item_type", "user")
      .eq("item_id", post.id)
      .maybeSingle(),
    supabase
      .from("saved_items")
      .select("id", { count: "exact", head: true })
      .eq("item_type", "user")
      .eq("item_id", post.id),
  ]);

  return (
    <UserPostView
      post={post}
      authorNickname={profileRes.data?.nickname ?? "익명"}
      isMine={post.user_id === user.id}
      isSaved={!!savedRes.data}
      reads={readsRes.count ?? 0}
    />
  );
}
