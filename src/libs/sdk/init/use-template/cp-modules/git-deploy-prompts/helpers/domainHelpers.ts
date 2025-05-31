import { rseOrgBase } from "~/libs/sdk/constants";

const specialDomains = [
  // Vercel domains
  ".vercel.app",

  // Local development
  "localhost",
  ".local",
  ".test",

  // Example/placeholder domains
  "example.com",

  // Project specific domains
  `.${rseOrgBase}`,
  ".relivator.com",
  ".bleverse.com",
];

// Helper function to check if domain is special
export function isSpecialDomain(d: string): boolean {
  return specialDomains.some(
    (special) =>
      // Exact match
      d === special ||
      // Ends with for TLD/subdomain patterns
      (special.startsWith(".") && d.endsWith(special)) ||
      // Full domain match
      d.toLowerCase() === special.toLowerCase(),
  );
}
