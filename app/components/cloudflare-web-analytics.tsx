import Script from "next/script";

/**
 * Optional Cloudflare Web Analytics beacon.
 * Set CLOUDFLARE_WEB_ANALYTICS_TOKEN as a Worker runtime variable.
 * No account identifier, profile data, or application event payload is sent.
 */
export default function CloudflareWebAnalytics() {
  const token = process.env.CLOUDFLARE_WEB_ANALYTICS_TOKEN?.trim();
  if (!token || !/^[a-zA-Z0-9_-]{8,128}$/.test(token)) return null;

  return (
    <Script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
      strategy="afterInteractive"
    />
  );
}
