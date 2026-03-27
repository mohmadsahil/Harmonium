import type { Metadata } from "next";
import { HarmoniumPlayer } from "@/components/harmonium/harmonium-player";

export const metadata: Metadata = {
  title: "Play Harmonium Online Free",
  description:
    "Real-time browser harmonium with mouse, keyboard, touch, chords, recording, metronome, and MIDI.",
};

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Virtual Harmonium Player",
  applicationCategory: "MusicApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Play harmonium online with keyboard and touch support, Indian classical modes, recording, and metronome.",
};

export default function HomePage() {
  return (
    <main className="pb-8 pt-6 md:pt-10">
      <section className="content-wrap glass-panel rounded-3xl p-4 md:p-6">
        <HarmoniumPlayer />
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </main>
  );
}
