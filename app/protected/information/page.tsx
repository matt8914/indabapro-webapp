import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Info, Mail, Phone } from "lucide-react";

export default async function InformationPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Information</h1>
        <p className="text-gray-500 mt-1">
          Important information about the IndabaPro application.
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white shadow-sm rounded-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-orange-100 p-3 rounded-full">
            <Info className="h-6 w-6 text-orange-500" />
          </div>
          <h2 className="text-xl font-medium text-gray-900">Testing Phase Notice</h2>
        </div>
        
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p className="text-lg">
            Please note that this app is in the <strong>testing phase</strong>.
          </p>
          
          <p>
            Our goal is to save you, remedial teachers and private therapists time and to make your lives easier, 
            allowing you to spend less time on admin and repetitive tasks and more time doing the things you love.
          </p>
          
          <p>
            If you have any suggestions on how you would like to improve this experience or if you need help, 
            please reach out to <strong>Nicola Steele</strong>.
          </p>
        </div>

        {/* Contact Information */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Details</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <a 
                  href="mailto:info@indabapro.co.za" 
                  className="text-orange-600 hover:text-orange-700 transition-colors"
                >
                  info@indabapro.co.za
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Cell Number</p>
                <a 
                  href="tel:+27824256961" 
                  className="text-orange-600 hover:text-orange-700 transition-colors"
                >
                  082 425 6961
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Note */}
        <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            <strong>Thank you</strong> for being part of our testing phase. Your feedback is invaluable 
            in helping us create the best possible experience for educators and therapists.
          </p>
        </div>
      </div>
    </div>
  );
} 