import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://rebound.app",
  integrations: [sitemap()],
  output: "static",
});
