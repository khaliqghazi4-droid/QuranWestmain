import { redirect } from "next/navigation";

// Self-registration is disabled — accounts are created by the academy admin.
export default function SignupPage() {
  redirect("/login");
}
