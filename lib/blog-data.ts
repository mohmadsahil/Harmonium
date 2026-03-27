export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  content: string[];
  keyword: string;
  category: string;
}

const basePosts: BlogPost[] = [
  {
    slug: "play-harmonium-online",
    title: "Play Harmonium Online: Complete Beginner Workflow",
    description:
      "Learn how to play harmonium online with keyboard shortcuts, Sa setup, and daily drills.",
    date: "2026-03-10",
    content: [
      "Start with middle octave and keep transpose at 0 to build stable pitch memory.",
      "Practice Sa Re Ga Ma with the metronome at 70 BPM, then increase gradually.",
      "Use recording playback to identify uneven note pressure and timing drift.",
    ],
    keyword: "play harmonium online",
    category: "Learning & beginner",
  },
  {
    slug: "learn-harmonium-free",
    title: "Learn Harmonium Free: 7-Day Practice Blueprint",
    description:
      "A practical weekly plan for students who want to learn harmonium free at home.",
    date: "2026-03-14",
    content: [
      "Day 1 and 2 focus on fingering and scale consistency.",
      "Day 3 and 4 introduce simple bhajan progressions in two octaves.",
      "Day 5 to 7 combine alaap, drone listening, and short composition playback.",
    ],
    keyword: "learn harmonium online free",
    category: "Learning & beginner",
  },
  {
    slug: "harmonium-notes-for-beginners",
    title: "Harmonium Notes for Beginners: Sargam to Western Bridge",
    description:
      "Understand harmonium notes for beginners with both Hindustani and Carnatic labels.",
    date: "2026-03-20",
    content: [
      "Keep note labels visible until hand movement becomes automatic.",
      "Switch between Sa Re Ga and C D E modes to train flexible notation reading.",
      "Use coupler lightly for color, not to mask intonation mistakes.",
    ],
    keyword: "harmonium notes for beginners",
    category: "Learning & beginner",
  },
];

const keywordGroups: Array<{ category: string; keywords: string[] }> = [
  {
    category: "Core discovery",
    keywords: [
      "online harmonium",
      "play harmonium online",
      "harmonium online play",
      "virtual harmonium",
      "free online harmonium",
      "harmonium keyboard online",
      "harmonium player online",
      "harmonium simulator",
    ],
  },
  {
    category: "Riyaz & practice",
    keywords: [
      "harmonium for riyaz online",
      "online riyaz harmonium",
      "harmonium riyaz",
      "sa re ga ma pa online harmonium",
      "swara practice online",
      "sur practice harmonium",
      "online music riyaz tool",
      "harmonium sargam practice",
    ],
  },
  {
    category: "Kirtan & bhajan",
    keywords: [
      "harmonium for kirtan online",
      "kirtan harmonium",
      "bhajan harmonium online",
      "online harmonium for bhajan",
      "harmonium for pooja",
      "harmonium for aarti",
      "sikh harmonium online",
      "gurbani harmonium online",
    ],
  },
  {
    category: "Features & tool",
    keywords: [
      "harmonium with scale changer online",
      "harmonium sa re ga ma keyboard",
      "harmonium drone online",
      "tanpura harmonium online",
      "harmonium with notes labels",
      "harmonium app free",
      "mobile harmonium app",
      "harmonium without download",
      "harmonium no install",
      "harmonium web app",
    ],
  },
  {
    category: "Learning & beginner",
    keywords: [
      "learn harmonium online free",
      "harmonium notes for beginners",
      "how to play harmonium",
      "harmonium notes sa re ga",
      "harmonium scale chart",
      "harmonium shruti chart",
      "harmonium sargam notes",
      "harmonium lesson online free",
    ],
  },
  {
    category: "Hindi keywords",
    keywords: ["ऑनलाइन हारमोनियम", "हारमोनियम बजाओ", "मुफ्त हारमोनियम ऑनलाइन", "हारमोनियम सीखें"],
  },
  {
    category: "Geo / diaspora",
    keywords: [
      "online harmonium India",
      "online harmonium UK",
      "online harmonium USA",
      "online harmonium Canada",
      "online harmonium for Punjabi songs",
      "harmonium for Indian classical music",
    ],
  },
  {
    category: "Long-tail / question",
    keywords: [
      "how to play harmonium online",
      "best free online harmonium",
      "harmonium online free no download",
      "play harmonium on computer",
      "harmonium for singing practice",
      "virtual harmonium for singers",
      "harmonium keyboard for riyaz",
      "harmonium online tool for beginners",
    ],
  },
];

const hindiSlugMap: Record<string, string> = {
  "ऑनलाइन हारमोनियम": "online-harmonium-hindi",
  "हारमोनियम बजाओ": "harmonium-bajao-hindi",
  "मुफ्त हारमोनियम ऑनलाइन": "muft-harmonium-online-hindi",
  "हारमोनियम सीखें": "harmonium-seekhen-hindi",
};

function keywordToSlug(keyword: string, index: number): string {
  if (hindiSlugMap[keyword]) {
    return hindiSlugMap[keyword];
  }

  const slug = keyword
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  return slug.length ? slug : `harmonium-keyword-${index + 1}`;
}

function keywordToTitle(keyword: string): string {
  return `${keyword} | Virtual Harmonium Guide`;
}

function buildKeywordPost(keyword: string, category: string, index: number): BlogPost {
  const slug = keywordToSlug(keyword, index);
  const day = String((index % 27) + 1).padStart(2, "0");

  return {
    slug,
    keyword,
    category,
    title: keywordToTitle(keyword),
    description: `Practical guide for \"${keyword}\" with instant browser practice, Sa setup, and daily drills.`,
    date: `2026-03-${day}`,
    content: [
      `This article targets the keyword \"${keyword}\" and shows how to practice effectively using the virtual harmonium player.`,
      "Start with slow swara movement and keep the metronome around 65 to 80 BPM for clean intonation.",
      "Use transpose, octave, reeds, and drone together to simulate real singing or accompaniment sessions.",
      "Record one short take daily and compare timing and sur accuracy after playback.",
      "Continue your routine with internal links: Learn Harmonium, Ragas Library, and Home Player.",
    ],
  };
}

const generatedKeywordPosts = keywordGroups.flatMap((group) =>
  group.keywords.map((keyword, index) => buildKeywordPost(keyword, group.category, index)),
);

const deduped = new Map<string, BlogPost>();
[...basePosts, ...generatedKeywordPosts].forEach((post) => {
  if (!deduped.has(post.slug)) {
    deduped.set(post.slug, post);
  }
});

export const blogPosts: BlogPost[] = [...deduped.values()].sort((a, b) =>
  b.date.localeCompare(a.date),
);

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedPosts(post: BlogPost, limit = 6) {
  return blogPosts
    .filter((entry) => entry.slug !== post.slug && entry.category === post.category)
    .slice(0, limit);
}
