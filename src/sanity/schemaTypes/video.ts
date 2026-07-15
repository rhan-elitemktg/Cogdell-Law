import { defineType, defineField } from "sanity";
import { icons } from "@sanity/icons";

/**
 * A firm video hosted on Wistia. Playback happens in a lightbox that only loads
 * the Wistia player once a video is opened; the poster is shown until then.
 *
 * Deliberately just a curated title + the Wistia id. Everything else about the
 * media — runtime and poster image — is Wistia's to know, and is read from its
 * oEmbed endpoint at build time (src/lib/wistia.ts). Storing either here would
 * only let it drift from the real video. See docs/sanity-integration.md (D8).
 *
 * NOTE: `@sanity/icons` in this project exposes no named exports — index into
 * `icons` instead. `import { PlayIcon }` takes the whole build down.
 */
export const video = defineType({
  name: "video",
  title: "Video",
  type: "document",
  icon: icons.play,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "wistiaId",
      title: "Wistia ID",
      type: "string",
      description:
        'The hashed media id from the Wistia URL, e.g. "out2hqx46o". This is what loads the player.',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "wistiaId" },
  },
});
