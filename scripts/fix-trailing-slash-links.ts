/**
 * Normalises internal Portable Text links that carry a trailing slash.
 *
 *   npx sanity exec scripts/fix-trailing-slash-links.ts --with-user-token          # dry run
 *   APPLY=1 npx sanity exec scripts/fix-trailing-slash-links.ts --with-user-token  # write
 *
 * `/contact/` still resolves — `trailingSlash: false` in vercel.json redirects
 * it — but every hop is a wasted round trip and the rest of the content uses the
 * bare form. This keeps them consistent.
 *
 * Scans every published document's `body` rather than a fixed list, so it also
 * catches links an editor adds later. Re-running once clean is a no-op.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

interface MarkDef {
  _type: string;
  _key: string;
  href?: string;
}
interface Block {
  _type: string;
  _key: string;
  markDefs?: MarkDef[];
}
interface Doc {
  _id: string;
  _type: string;
  slug?: { current?: string };
  body?: Block[];
}

const needsFix = (href: unknown): href is string =>
  typeof href === "string" && href.startsWith("/") && href !== "/" && href.endsWith("/");

const docs = await client.fetch<Doc[]>(
  `*[!(_id in path("drafts.**")) && defined(body)]{_id, _type, slug, body}`,
);

const apply = process.env.APPLY === "1";
console.log(apply ? "APPLYING\n" : "DRY RUN — set APPLY=1 to write\n");

const tx = client.transaction();
let count = 0;

for (const doc of docs) {
  for (const block of doc.body ?? []) {
    if (block._type !== "block") continue;
    for (const def of block.markDefs ?? []) {
      if (def._type !== "link" || !needsFix(def.href)) continue;
      const fixed = def.href.replace(/\/+$/, "");
      console.log(`${doc._type}  /${doc.slug?.current}  ${def.href}  ->  ${fixed}`);
      tx.patch(doc._id, (p) =>
        p.set({
          [`body[_key=="${block._key}"].markDefs[_key=="${def._key}"].href`]: fixed,
        }),
      );
      count++;
    }
  }
}

console.log(`\nlinks to normalise: ${count}`);
if (apply && count) {
  await tx.commit();
  console.log("committed");
} else if (!apply) {
  console.log("nothing written");
}
