import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
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

  // Verify super admin access
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('first_name, last_name, role')
    .eq('id', user.id)
    .single();

  if (userError || !userData || userData.role !== 'super_admin') {
    return redirect("/protected");
  }

  const handleSignOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full absolute inset-0">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <Link href="/protected/admin" className="flex-shrink-0">
                <Image 
                  src="/images/indabapro logo.png" 
                  alt="IndabaPro Logo" 
                  width={120}
                  height={40}
                  priority
                  className="h-8 w-auto"
                />
              </Link>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Platform Owner</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/protected" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to App
                </Link>
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {userData.first_name} {userData.last_name}
                  </p>
                  <p className="text-xs text-gray-500">Super Admin</p>
                </div>
                <form action={handleSignOut}>
                  <Button variant="ghost" size="sm" type="submit" className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full flex-1 overflow-y-auto">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
} 