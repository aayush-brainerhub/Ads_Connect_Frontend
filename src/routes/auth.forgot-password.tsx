import { createFileRoute, Link } from "@tanstack/react-router";
import { Button, Input, Field } from "@/components/ui-kit";
import { AuthShell, FormError } from "./auth.login";

export const Route = createFileRoute("/auth/forgot-password")({
  component: ForgotPage,
  head: () => ({ meta: [{ title: "Reset password — AdsConnect" }] }),
});

/**
 * Password reset needs an email sender, which AdsConnect does not have — PMS
 * sends its reset and verification mail through IMailSender, and there is no
 * equivalent here yet. The form is disabled rather than pretending a code went
 * out, which is what it did before.
 *
 * A signed-in user can still change their password: POST /api/SignIn/ChangePassword.
 */
function ForgotPage() {
  return (
    <AuthShell title="Reset password" subtitle="We'll send you a verification code">
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <Field label="Email or phone">
          <Input disabled />
        </Field>
        <FormError>
          Password reset isn't available yet — AdsConnect has no email sender wired up, so no code
          can be sent. Ask an administrator to reset the account for now.
        </FormError>
        <Button type="button" className="w-full" disabled>
          Send code
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-white/60">
        <Link to="/auth/login" className="text-white hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
