import { defineCliConfig } from "sanity/cli";
import { loadEnv } from "vite";

// Mirrors astro.config.mjs: this file runs before Astro's env loading, so read
// the same PUBLIC_ vars through Vite rather than import.meta.env.
const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } = loadEnv(
  process.env.NODE_ENV ?? "development",
  process.cwd(),
  "",
);

export default defineCliConfig({
  api: {
    projectId: PUBLIC_SANITY_PROJECT_ID,
    dataset: PUBLIC_SANITY_DATASET,
  },
  // Lets `npx sanity exec` run the seed scripts in scripts/, and enables
  // `npm run typegen`.
  typegen: {
    enabled: true,
  },
});
