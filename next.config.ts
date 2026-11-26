import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  // Metadata is computed locally. Resolve it before streaming the page so raw
  // HTML crawlers receive title, description, robots and canonical in <head>.
  htmlLimitedBots: /.*/,
};

export default nextConfig;
