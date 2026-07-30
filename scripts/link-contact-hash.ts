/**
 * Points contact-page links at the form itself: `/contact` -> `/contact#contact`.
 *
 *   npx sanity exec scripts/link-contact-hash.ts --with-user-token          # dry run
 *   APPLY=1 npx sanity exec scripts/link-contact-hash.ts --with-user-token  # write
 *
 * `#contact` is the Consult band's anchor. ConsultForm's script focuses the
 * first field when a link resolves to it, so the hash is what turns "go to the
 * contact page" into "put the caret in the form" — which is the accessibility
 * fix: following a link that only scrolls leaves focus behind, and a keyboard or
 * screen-reader user never reaches the form.
 *
 * Only content links are rewritten. The main nav's "Contact" lives in
 * src/data/navigation.ts and is deliberately left alone: it's navigational, and
 * the ContactMethods cards above the form (phone, email, office) are usually
 * what someone clicking "Contact" in the nav actually wants.
 *
 * Idempotent — an href that already carries a hash doesn't match.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const FROM = /^\/contact\/?$/;
const TO = "/contact#contact";

interface Hit {
  path: string;
  from: string;
  label?: string;
}

/**
 * Collects a Sanity patch path for every bare contact href in a document.
 * Array members are addressed by `_key` where they have one so the path stays
 * valid if the array is reordered; anything keyless falls back to its index.
 */
function collect(node: unknown, path: string, out: Hit[]): void {
  if (Array.isArray(node)) {
    node.forEach((item, i) => {
      const key =
        item && typeof item === "object" && "_key" in item
          ? `[_key=="${(item as { _key: string })._key}"]`
          : `[${i}]`;
      collect(item, path + key, out);
    });
    return;
  }
  if (!node || typeof node !== "object") return;

  const obj = node as Record<string, unknown>;
  if (typeof obj.href === "string" && FROM.test(obj.href)) {
    out.push({
      path: `${path}.href`,
      from: obj.href,
      label: typeof obj.label === "string" ? obj.label : undefined,
    });
  }
  for (const [k, v] of Object.entries(obj)) {
    if (k === "href" || k.startsWith("_")) continue;
    collect(v, path ? `${path}.${k}` : k, out);
  }
}

const docs = await client.fetch<Record<string, unknown>[]>(
  `*[!(_id in path("drafts.**"))]`,
);

const apply = process.env.APPLY === "1";
console.log(apply ? "APPLYING\n" : "DRY RUN — set APPLY=1 to write\n");

const tx = client.transaction();
let total = 0;

for (const doc of docs) {
  const hits: Hit[] = [];
  for (const [k, v] of Object.entries(doc)) {
    if (k.startsWith("_") || k === "slug") continue;
    collect(v, k, hits);
  }
  if (!hits.length) continue;

  const slug = (doc.slug as { current?: string } | undefined)?.current ?? "(singleton)";
  console.log(`${doc._type}  ${slug}`);
  for (const h of hits) {
    console.log(`    ${h.path}${h.label ? `  "${h.label}"` : ""}`);
    tx.patch(doc._id as string, (p) => p.set({ [h.path]: TO }));
    total++;
  }
}

console.log(`\nlinks to rewrite: ${total}`);
if (apply && total) {
  await tx.commit();
  console.log("committed");
} else if (!apply) {
  console.log("nothing written");
}
