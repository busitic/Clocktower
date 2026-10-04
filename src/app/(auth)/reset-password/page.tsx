import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";


// In Next 16, searchParams is a Promise in server components
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Invalid link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              This reset link is missing its token. Please request a new one.
            </p>
            <Link href="/forgot-password" className="text-sm font-medium underline-offset-4 hover:underline">
              Request a new link
            </Link>
          </CardContent>
        </Card>
      )}
    </main>
  );
}