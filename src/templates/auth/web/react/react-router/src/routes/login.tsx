import { useState } from "react";

// @ts-expect-error dler-remove-comment
import SignInForm from "@/components/sign-in-form";
// @ts-expect-error dler-remove-comment
import SignUpForm from "@/components/sign-up-form";

export default function Login() {
  const [showSignIn, setShowSignIn] = useState(false);

  return showSignIn ? (
    <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
  ) : (
    <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
  );
}
