// Firm videos — hosted on Wistia. Playback happens in a lightbox that only loads
// the Wistia player when a video is opened; the grid shows poster thumbnails.

export interface VideoItem {
  id: string; // Wistia hashed media id
  title: string;
  duration: string; // display form, e.g. "1:59"
  poster: string; // Wistia thumbnail (1280x720)
}

/** Wistia iframe embed URL for a given media id (used inside the lightbox). */
export const wistiaEmbed = (id: string) =>
  `https://fast.wistia.net/embed/iframe/${id}?autoPlay=true&playsinline=true`;

export const videos: VideoItem[] = [
  {
    id: "out2hqx46o",
    title: "Dan Cogdell Law Firm",
    duration: "1:59",
    poster:
      "https://embed-ssl.wistia.com/deliveries/3b85f42c09f4c782ff32c6f123b289202a076209.jpg?image_crop_resized=1280x720",
  },
  {
    id: "lkdv454x6f",
    title: "Dan Cogdell — Enron",
    duration: "3:10",
    poster:
      "https://embed-ssl.wistia.com/deliveries/7d74782321eb417471f0e00770e7f130a9de999c.jpg?image_crop_resized=1280x720",
  },
  {
    id: "035chk0v0i",
    title: "Richard “Racehorse” Haynes",
    duration: "3:45",
    poster:
      "https://embed-ssl.wistia.com/deliveries/e1a022c7c399969d4bc3c3da217a8af71f8ed422.jpg?image_crop_resized=1280x720",
  },
  {
    id: "5e2vhej9xk",
    title: "Dan Cogdell Law Firm — Anthony",
    duration: "1:59",
    poster:
      "https://embed-ssl.wistia.com/deliveries/c5143ff050c2179da55d4ad9e96e2503bd9f97b2.jpg?image_crop_resized=1280x720",
  },
  {
    id: "ltmlnegnid",
    title: "Firm Capacity Project",
    duration: "1:03",
    poster:
      "https://embed-ssl.wistia.com/deliveries/65b151cf2a9ea2262b1980bcd66ee999ce2b6acf.jpg?image_crop_resized=1280x720",
  },
];
