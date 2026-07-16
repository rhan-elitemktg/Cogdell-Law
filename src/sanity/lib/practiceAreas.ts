import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

/** Every practice area with its parent ref — the tree is rebuilt in JS. */
const ALL_QUERY = defineQuery(`*[_type == "practiceArea"] | order(orderRank){
  _id,
  title,
  heroTitle,
  lede,
  cardSummary,
  icon,
  intro,
  sections[]{ _key, heading, body },
  faqs[]{ _key, question, answer },
  "slug": slug.current,
  "parentId": parent._ref
}`);

export type PracticeAreaDoc = Awaited<ReturnType<typeof getAllPracticeAreas>>[number];

export async function getAllPracticeAreas() {
  return (await sanityClient.fetch(ALL_QUERY)) ?? [];
}

interface Node {
  doc: Awaited<ReturnType<typeof getAllPracticeAreas>>[number];
  path: string;
  trail: { title: string; href?: string }[];
  children: Node[];
}

/** Build the tree + every node's full path and breadcrumb trail. */
async function buildTree() {
  const docs = await getAllPracticeAreas();
  const byId = new Map(docs.map((d) => [d._id, d]));
  const childrenOf = new Map<string | null, typeof docs>();
  for (const d of docs) {
    const key = d.parentId ?? null;
    (childrenOf.get(key) ?? childrenOf.set(key, []).get(key)!).push(d);
  }

  const nodes = new Map<string, Node>();
  const roots: Node[] = [];

  function attach(doc: (typeof docs)[number], parentPath: string, parentTrail: Node["trail"]): Node {
    const path = parentPath ? `${parentPath}/${doc.slug}` : doc.slug!;
    const href = `/practice-areas/${path}`;
    const trail = [...parentTrail, { title: doc.title!, href }];
    const node: Node = { doc, path, trail, children: [] };
    nodes.set(path, node);
    for (const child of childrenOf.get(doc._id) ?? []) {
      node.children.push(attach(child, path, trail));
    }
    return node;
  }

  const rootTrail = [{ title: "Practice Areas", href: "/practice-areas" }];
  for (const doc of childrenOf.get(null) ?? []) roots.push(attach(doc, "", rootTrail));

  return { roots, nodes };
}

/** { params:{slug}, props } for every node — getStaticPaths. */
export async function getPracticeAreaPaths() {
  const { nodes } = await buildTree();
  return [...nodes.values()].map((n) => ({
    params: { slug: n.path },
    props: {
      node: n.doc,
      trail: n.trail,
      path: n.path,
      children: n.children.map((c) => ({
        title: c.doc.title,
        summary: c.doc.cardSummary,
        href: `/practice-areas/${c.path}`,
        icon: c.doc.icon,
      })),
    },
  }));
}

/** Top-level areas for the /practice-areas index grid. */
export async function getTopLevelPracticeAreas() {
  const { roots } = await buildTree();
  return roots.map((n) => ({
    title: n.doc.title,
    summary: n.doc.cardSummary,
    href: `/practice-areas/${n.path}`,
    icon: n.doc.icon,
  }));
}
