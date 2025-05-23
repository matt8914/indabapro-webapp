import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ProtectedLayoutWithConditionalSidebar } from "@/components/protected-layout-with-conditional-sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return <ProtectedLayoutWithConditionalSidebar>{children}</ProtectedLayoutWithConditionalSidebar>;
} 