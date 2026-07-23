import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./src/sanity/schemaTypes/index";
import { structure, NON_CREATABLE } from "./src/sanity/structure";

// This file is loaded from two very different places:
//   - the browser Studio, bundled by Astro/Vite → import.meta.env.PUBLIC_* exists
//   - the Sanity CLI (schema extract / typegen), plain Node → import.meta.env is
//     absent or empty, but the CLI loads .env into process.env
// Take the first source that actually carries the value, so one .env stays the
// single source of truth for both.
const viteEnv: Record<string, string | undefined> | undefined = import.meta.env;
const nodeEnv: Record<string, string | undefined> | undefined =
  typeof process !== "undefined" ? process.env : undefined;

const projectId =
  viteEnv?.PUBLIC_SANITY_PROJECT_ID ?? nodeEnv?.PUBLIC_SANITY_PROJECT_ID;
const dataset = viteEnv?.PUBLIC_SANITY_DATASET ?? nodeEnv?.PUBLIC_SANITY_DATASET;

export default defineConfig({
  projectId,
  dataset,
  plugins: [structureTool({ structure })],
  schema: {
    types: schemaTypes,
  },
  document: {
    // Keep singletons — and legalPage, which is managed as two fixed docs — out
    // of the global "＋ Create" menu, so none can be duplicated into an orphan.
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === "global"
        ? prev.filter((item) => !NON_CREATABLE.includes(item.templateId ?? ""))
        : prev,
  },
});
