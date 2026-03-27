import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Virtual Harmonium Player",
    short_name: "Harmonium",
    description: "Play harmonium online with keyboard, touch, MIDI and raga practice tools.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f1117",
    theme_color: "#f59e0b",
    orientation: "landscape-primary",
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
