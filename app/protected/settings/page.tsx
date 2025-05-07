import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { KeyRound, User } from "lucide-react";
import { resetPasswordAction, updateProfileAction } from "@/app/actions";

export default async function SettingsPage({
  searchParams
}: {
  searchParams: { message?: string; type?: string }
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get success/error messages from search params
  const message = searchParams.message;
  const type = searchParams.type;

  // Get user profile data
  const { data: userData, error } = await supabase
    .from('users')
    .select('first_name, last_name, email, role, school_id')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user data:', error);
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your profile and security settings
        </p>
      </div>

      {/* Display messages if any */}
      {message && (
        <div className={`p-3 rounded-md ${type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {message}
        </div>
      )}

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and profile information
              </CardDescription>
            </CardHeader>
            <form action={updateProfileAction}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName"
                      name="firstName"
                      defaultValue={userData?.first_name} 
                      placeholder="Your first name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName"
                      name="lastName"
                      defaultValue={userData?.last_name} 
                      placeholder="Your last name"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    defaultValue={userData?.email} 
                    placeholder="your.email@example.com"
                    disabled
                  />
                  <p className="text-xs text-gray-500">
                    For email changes, please contact your administrator
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <div className="flex items-center">
                    <Badge variant="secondary" className="px-3 py-1">
                      {userData?.role || "Teacher"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    Your role determines your access level in the system
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" className="bg-[#f6822d] hover:bg-[#e67220] text-white">Save Changes</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>
                Manage your password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Password Reset</h3>
                <p className="text-sm text-gray-500">
                  You'll receive an email with instructions to reset your password
                </p>
              </div>
              <form action={resetPasswordAction}>
                <input type="hidden" name="email" value={userData?.email || ''} />
                <Button type="submit" variant="outline" className="w-full sm:w-auto border-[#f6822d] text-[#f6822d] hover:bg-[#fff8f3] hover:text-[#f6822d]">
                  Send Password Reset Email
                </Button>
              </form>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-4">Two-Factor Authentication</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox id="2fa" />
                  <label
                    htmlFor="2fa"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Enable two-factor authentication
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enhance your account security by requiring a verification code in addition to your password
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Manage your active login sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Current Browser</p>
                    <p className="text-sm text-gray-500">Windows • Chrome • Active now</p>
                  </div>
                  <Badge>Current</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <form action="/api/sign-out">
                <Button variant="destructive" type="submit" className="bg-red-600 hover:bg-red-700 text-white">Sign Out All Devices</Button>
              </form>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 