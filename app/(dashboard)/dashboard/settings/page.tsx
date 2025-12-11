import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Shield,
  Key,
  Bell,
  Palette,
  Database,
  Sparkles,
} from "lucide-react";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-violet-600" />
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={session.user.image || undefined}
                alt={session.user.name || "User"}
              />
              <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-2xl">
                {session.user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{session.user.name}</h3>
              <p className="text-sm text-muted-foreground">
                {session.user.email}
              </p>
              <Badge variant="secondary" className="mt-2">
                <Sparkles className="w-3 h-3 mr-1" />
                Content Creator
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {session.user.email}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-green-600">
                Verified
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Account Status</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-violet-600" />
            <div>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your security preferences
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">
                Change your password
              </p>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security
              </p>
            </div>
            <Button variant="outline" size="sm">
              Enable
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-violet-600" />
            <div>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Email notifications for content updates
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Data Export</p>
                <p className="text-sm text-muted-foreground">
                  Download all your content data
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
