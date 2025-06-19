import { re } from "@reliverse/relico";
import { outro, spinner, log } from "@reliverse/rempts";

export interface SponsorEntry {
  readonly sponsor: {
    readonly login: string;
    readonly name?: string | null;
    readonly avatarUrl?: string | null;
    readonly websiteUrl?: string | null;
    readonly linkUrl?: string | null;
    readonly type?: string;
  };
  readonly isOneTime: boolean;
  readonly monthlyDollars?: number;
  readonly tierName?: string;
}

export const SPONSORS_JSON_URL = "https://sponsors.amanv.dev/sponsors.json";

export async function fetchSponsors(
  url: string = SPONSORS_JSON_URL,
): Promise<SponsorEntry[]> {
  const s = spinner();
  s.start("Fetching sponsors…");

  const response = await fetch(url);
  if (!response.ok) {
    s.stop(re.red(`Failed to fetch sponsors: ${response.statusText}`));
    throw new Error(`Failed to fetch sponsors: ${response.statusText}`);
  }

  const sponsors = (await response.json()) as SponsorEntry[];
  s.stop("Sponsors fetched successfully!");
  return sponsors;
}

export function displaySponsors(sponsors: SponsorEntry[]): void {
  if (sponsors.length === 0) {
    log.info("No sponsors found. You can be the first one! ✨");
    outro(
      re.cyan(
        "Visit https://github.com/sponsors/AmanVarshney01 to become a sponsor.",
      ),
    );
    return;
  }

  sponsors.forEach((entry: SponsorEntry, idx: number) => {
    const sponsor = entry.sponsor;
    const displayName = sponsor.name ?? sponsor.login;
    const tier = entry.tierName ? ` (${entry.tierName})` : "";

    log.step(`${idx + 1}. ${re.green(displayName)}${re.yellow(tier)}`);
    log.message(`   ${re.dim("GitHub:")} https://github.com/${sponsor.login}`);

    const website = sponsor.websiteUrl ?? sponsor.linkUrl;
    if (website) {
      log.message(`   ${re.dim("Website:")} ${website}`);
    }
  });

  log.message("");
  outro(
    re.magenta(
      "Visit https://github.com/sponsors/AmanVarshney01 to become a sponsor.",
    ),
  );
}
