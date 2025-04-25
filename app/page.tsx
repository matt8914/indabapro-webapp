import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return redirect("/protected");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="mb-12">
        <Image
          src="/images/indabapro logo.png"
          alt="IndabaPro Logo"
          width={240}
          height={100}
          priority
        />
      </div>
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          School Readiness & Scholastic Assessments
        </h1>
        <p className="text-lg text-gray-600">
          A web-based platform enabling teachers and school administrators to efficiently log, track, and analyze student assessment data.
        </p>
        <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-4">
          <Button asChild className="bg-[#f6822d] hover:bg-orange-600" size="lg">
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/sign-up">Create an Account</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
