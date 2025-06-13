import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

// @ts-expect-error <dler-remove-comment>
import SignInForm from "@/components/sign-in-form";
// @ts-expect-error <dler-remove-comment>
import SignUpForm from "@/components/sign-up-form";

// @ts-expect-error <dler-remove-comment>
export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const [showSignIn, setShowSignIn] = useState(false);

  return showSignIn ? (
    <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
  ) : (
    <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
  );
}
