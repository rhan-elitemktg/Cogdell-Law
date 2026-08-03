/**
 * Backfills `teamGroup` on team member documents that predate the field.
 *
 *   npx sanity exec scripts/backfill-team-group.ts --with-user-token          # dry run
 *   APPLY=1 npx sanity exec scripts/backfill-team-group.ts --with-user-token  # write
 *
 * `teamGroup` drives the Attorneys / Paralegals split in the "Our Team" menu.
 * It's a separate field from `role` on purpose: role is free text ("Of Counsel",
 * "Principal & Founder"), so grouping the menu off it would misfile anyone whose
 * title is worded differently.
 *
 * Seeding here reads `role` only as a one-time guess for documents that have no
 * value yet — setIfMissing, so it never overrides an editor's choice.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const people = await client.fetch<
  { _id: string; name: string | null; role: string | null; teamGroup: string | null }[]
>(`*[_type == "attorney" && !(_id in path("drafts.**"))]{_id, name, role, teamGroup}`);

const apply = process.env.APPLY === "1";
console.log(apply ? "APPLYING\n" : "DRY RUN — set APPLY=1 to write\n");

const tx = client.transaction();
let n = 0;

for (const p of people) {
  if (p.teamGroup) {
    console.log(`  = ${p.name}  already ${p.teamGroup}`);
    continue;
  }
  const group = /paralegal/i.test(p.role ?? "") ? "paralegal" : "attorney";
  console.log(`  + ${p.name}  role="${p.role}"  ->  ${group}`);
  tx.patch(p._id, (patch) => patch.setIfMissing({ teamGroup: group }));
  n++;
}

console.log(`\ndocuments to set: ${n} of ${people.length}`);
if (apply && n) {
  await tx.commit();
  console.log("committed");
} else if (!apply) {
  console.log("nothing written");
}
