import { createClient } from "@/utils/supabase/server";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAction } from "@/app/actions";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: Record<string, string | undefined>;
}) {
  const supabase = await createClient();

  if (searchParams?.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(
      searchParams.code
    );

    if (error) {
      return (
        <p className="text-red-500 text-center">
          Invalid or expired reset link.
        </p>
      );
    }
  }

  return (
    <form className="flex flex-col w-full max-w-md p-4 gap-2 [&>input]:mb-4">
      <h1 className="text-2xl font-medium">Reset password</h1>

      <Label>New password</Label>
      <Input type="password" name="password" required />

      <Label>Confirm password</Label>
      <Input type="password" name="confirmPassword" required />

      <SubmitButton formAction={resetPasswordAction}>
        Reset password
      </SubmitButton>

      <FormMessage
        message={{
          error: searchParams?.error ?? "",
          success: searchParams?.success ?? "",
        }}
      />
    </form>
  );
}
