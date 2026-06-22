type AnalyticsProvider = "none" | "cloudflare";

const requestedProvider = (import.meta.env.PUBLIC_TLAC_ANALYTICS_PROVIDER ?? "none")
  .trim()
  .toLowerCase();
const cloudflareToken = (import.meta.env.PUBLIC_TLAC_CLOUDFLARE_ANALYTICS_TOKEN ?? "").trim();

function resolveProvider(): AnalyticsProvider {
  if (requestedProvider === "cloudflare" && cloudflareToken.length > 0) {
    return "cloudflare";
  }

  return "none";
}

export const analyticsConfig = {
  provider: resolveProvider(),
  cloudflareToken,
} as const;
