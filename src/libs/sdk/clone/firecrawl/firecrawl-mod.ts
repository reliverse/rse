import FirecrawlApp from "@mendable/firecrawl-js";

export async function useFirecrawl(url: string) {
  const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

  const crawlResponse = await app.crawlUrl(url, {
    limit: 100,
    scrapeOptions: {
      formats: ["markdown", "html"],
    },
  });

  if (!crawlResponse.success) {
    throw new Error(`Failed to crawl: ${crawlResponse.error}`);
  }

  console.log(crawlResponse);
}
