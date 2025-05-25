import { relinka } from "@reliverse/relinka";

export function useResendMail() {
  relinka(
    "info",
    "This integration is currently in development. Please check back later.",
  );
}
