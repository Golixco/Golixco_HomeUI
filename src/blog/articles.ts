export interface ArticleSection {
  id: string;
  title: string;
  body: string;
}
export interface Article {
  slug: string;
  category: string;
  title: string;
  description: string;
  cover: string;
  coverAlt: string;
  modified: string;
  published?: string;
  sections: ArticleSection[];
}
export const articles: Article[] = [
  {
    slug: 'the-golixco-blog',
    category: 'Company / Perspective',
    title: 'Golixco: a name, an idea, a way of building.',
    description:
      'The thinking behind Golixco, the identity taking shape around it, and the first product bringing that thinking into the world.',
    cover: '/blog/golixco-cover.svg',
    coverAlt: 'Official Golixco emblem alongside an original monochrome grid of connected pixels.',
    modified: '2026-11-10',
    published: '2026-11-10',
    sections: [
      {
        id: 'starting-point',
        title: 'The Starting Point',
        body: `A company introduction should make a few things clear: what is being built, why it matters, and what someone can actually experience today. Golixco starts with a straightforward ambition: use modern artificial intelligence, software and creativity to build useful products. The interest is in turning possibilities into something a person can use, examine and respond to.

That ambition is still taking shape. Golixco is an AI-focused company identity with a live public-beta product, Lolixco. This publication is a place to explain the work with enough detail to make it understandable: the ideas behind a product, the decisions visible in its interface, and the boundaries of what it currently does. An idea can be ambitious while its description remains precise.`,
      },
      {
        id: 'what-is-golixco',
        title: 'What Is Golixco?',
        body: `Golixco combines artificial intelligence, software, experimentation and product development. Its focus is on solving problems and making technology useful to creators, developers and people with ideas they want to explore. The company's core question is practical: what can a small operation build when modern AI becomes a substantial part of the development process?

Lolixco is the first public product in that direction. It brings cinematic video-edit discovery together with experimental AI-assisted edit analysis. Golixco is the parent company; Lolixco is a distinct product under it. The two share an interest in creativity and accessible technology, while serving different purposes. This website explains the company. Lolixco is where the product experience happens.`,
      },
      {
        id: 'story-behind-the-name',
        title: 'The Story Behind the Name',
        body: `The name Golixco originated as an online identity and gaming handle in 2020. Over time, a name became an idea, and that idea developed into an AI-focused company concept in 2026. The Golixco.com domain was acquired in 2026. Those are milestones in the evolution of an identity; they should not be confused with a verified date of incorporation or formal company founding.

Golixco is not an official acronym. The letter X can suggest a technological or futuristic feeling, and CO resembles “company,” but those are informal interpretations rather than an established expansion of the name. The Latin-script name remains Golixco even when the website presents phonetic versions in other scripts. Those renderings are an expression of the brand, rather than separate company names.`,
      },
      {
        id: 'idea-to-company',
        title: 'From an Idea to a Company',
        body: `Moving from an idea to a product introduces a useful discipline: the interface has to work for someone who was not there when the idea was conceived. Descriptions must be clear, navigation must lead somewhere meaningful, and a visitor should be able to distinguish a working feature from a possible future direction.

For Golixco, that distinction is part of how the public story is told. Lolixco is live in public beta. Additional products, delivery dates, partnerships and commercial statistics are not publicly confirmed. The identities of the people behind the company remain private, and official leadership details have not been published. A product can be introduced in depth without inventing a personal biography, a funding narrative or a legal status.`,
      },
      {
        id: 'why-artificial-intelligence',
        title: 'Why Artificial Intelligence?',
        body: `AI is interesting to Golixco because it changes what a small operation can attempt. It can participate in the process of building software and support experiences that interpret information in a more useful way. That possibility is a reason to experiment, test and refine; it is not evidence that every AI-powered feature will be accurate or appropriate for every task.

Lolixco's Creator Studio makes this tension concrete. Local media-signal analysis can contribute evidence about an edit, while Gemini-supported semantic understanding can add context where available. The result is experimental feedback. It can help someone examine creative choices, but it cannot convert taste into a perfectly objective score. That boundary matters as much as the technology itself.`,
      },
      {
        id: 'our-mission',
        title: 'Our Mission',
        body: `Golixco's mission is to build intelligent products that empower creators, developers and dreamers to achieve more with technology. Simplicity, innovation and impact guide that work. In practice, the mission asks a product to make its purpose understandable, give people a useful way to act, and remain honest about its limits.

Simplicity is a demanding design choice. A short description should still convey the essential facts. A minimal interface should still offer clear navigation and readable feedback. Innovation becomes meaningful when someone can try the resulting experience. Impact is an aspiration to make useful work, rather than an unsupported claim about audience size or business performance.`,
      },
      {
        id: 'building-products',
        title: 'How We Approach Building Products',
        body: `The company philosophy brings together software, creativity and experimentation. A useful way to read that philosophy is as a loop: identify something worth making, turn it into a concrete experience, examine the result, and improve it. A public beta makes the current state visible while leaving room for the product to change.

Clear boundaries are part of that process. An experimental assessment should be called experimental. A concept should not appear in a list of live features. Contact details should direct a visitor to the right place. A newsletter form should not claim that someone has subscribed when no email has been saved. These are small interface decisions, but they determine how accurately a product represents itself.`,
      },
      {
        id: 'identity-and-interface',
        title: 'The Identity, and the Interface',
        body: `Golixco's visual language is deliberately restrained: a black background, white typography, soft grey borders and pixel-inspired details. The official geometric G emblem gives the company a recognizable point of focus. Binary-inspired textures and low-opacity elements add character while leaving the reading and navigation surfaces clear.

The homepage begins with a question rather than a long product catalogue. Visitors can ask about the company, its mission or Lolixco, use a suggested prompt, or scroll into the About and history sections. The multilingual name inside the input is decorative; it steps aside when someone focuses the field or begins typing. Reduced-motion settings give people a static English name instead of a continuous animation.

The company navigation connects Products, Blog, Contact and Follow. The Lolixco link opens the live product, while the blog provides a quieter reading space. On small screens, the menu expands into a usable list rather than compressing every destination into a narrow row. The same principle applies to these articles: a comfortable reading column, meaningful headings and a table of contents that moves out of the way on mobile.`,
      },
      {
        id: 'company-assistant',
        title: 'A Company Assistant With a Clear Job',
        body: `The assistant is here to explain Golixco and Lolixco. Common questions can receive immediate answers from approved company facts. More detailed conversation can use an external model when the service is configured and available. The same knowledge boundaries apply in either case: history helps explain a follow-up, but it does not establish new company facts.

This is intentionally a focused experience. Questions about unrelated public figures or general trivia are redirected to the company and product. Leadership identities remain private. Unsupported business statistics are not filled in with guesses. Links point to approved company destinations, and contact requests are routed according to the kind of help someone needs. AI can make mistakes, so those boundaries remain important even when an answer sounds confident.`,
      },
      {
        id: 'introducing-lolixco',
        title: 'Introducing Lolixco',
        body: `Lolixco is Golixco's live public-beta platform for cinematic video-edit discovery and AI-assisted edit analysis. Its content includes edits inspired by movies, television series, anime, gaming and other visual entertainment. Visitors can discover edits, browse Shorts, use randomized discovery, watch in Immersion, and explore experimental feedback in Creator Studio.

The initial launch catalogue contained 57 edits: 27 YouTube-hosted and 30 Lolixco-hosted. That number describes the launch, rather than a permanent or real-time total. The product has its own experience and identity, while remaining part of Golixco. For a detailed tour of the thinking, interface and released features, read [Introducing Lolixco](/blog/the-lol-product-lolixco), or [try the public beta](https://lol.golixco.com/).`,
      },
      {
        id: 'what-comes-next',
        title: 'What Comes Next',
        body: `The direction is to keep exploring useful AI software and products. That is a direction, not a promise of a particular launch date, feature or future business model. As the work develops, this publication can provide a place for product explanations and confirmed updates without presenting every possible idea as a commitment.

For now, the concrete next step for someone discovering Golixco is to experience Lolixco and understand the limits of its beta. Native mobile applications, memberships, creator monetization, user accounts and an automatic editor have not been confirmed as available features. The responsive mobile website and the experimental analyzer should be understood on their own terms.`,
      },
      {
        id: 'stay-connected',
        title: 'Stay Connected',
        body: `Find Golixco's public destinations in the [Follow section](/#stay-in-touch), explore the [blog index](/blog), or return to the [company homepage](/). These are different entry points into the same ecosystem: an introduction to the company, a closer explanation of the work, and a live product to try.

For company and business inquiries, write to [hello@golixco.com](mailto:hello@golixco.com). For a problem with Lolixco, use [support@golixco.com](mailto:support@golixco.com). Copyright, content-rights and removal inquiries belong at [rights@golixco.com](mailto:rights@golixco.com). Newsletter signup is coming soon; the homepage does not collect or save subscriptions yet.`,
      },
    ],
  },
  {
    slug: 'the-lol-product-lolixco',
    category: 'Lolixco / Product',
    title: 'Introducing Lolixco. Discover the edit. Explore the craft.',
    description:
      'A complete introduction to the live beta: cinematic discovery, the viewing interface, Creator Studio, and the creative choices behind the experience.',
    cover: '/blog/lolixco-cover.png',
    coverAlt:
      'Official monochrome Lolixco L/play emblem beside the editorial title, Discover the edit. Explore the craft.',
    modified: '2026-11-10',
    published: '2026-11-10',
    sections: [
      {
        id: 'introducing-lolixco',
        title: 'Introducing Lolixco',
        body: `Lolixco is a live public-beta product under Golixco. It is a cinematic video-edit discovery and AI-assisted edit-analysis platform, bringing together two connected interests: enjoying an edit and looking more closely at how it was made. The content spans movies, television series, anime, gaming and other visual entertainment.

The product is available through [lol.golixco.com](https://lol.golixco.com/). It is a website with mobile-friendly video browsing, rather than a confirmed native mobile application. Public beta describes the current experience honestly: the released features are available to try, while availability and functionality may change as the product develops.`,
      },
      {
        id: 'idea-behind-the-product',
        title: 'The Idea Behind the Product',
        body: `An edit can be a small creative work with a large emotional range. A sequence of familiar images can feel different when timing, music, pacing and structure change. Lolixco's premise is to give that form of visual entertainment a place for discovery, while offering creators a way to examine some of those decisions.

Discovery and analysis serve different moments. Sometimes the right experience is simply watching. At other times, someone wants to understand why a cut feels effective, why a sequence loses energy, or how an idea develops across an edit. The product brings both activities into one platform without requiring an AI assessment to be the purpose of every viewing session. The name of its parent company, Golixco, describes the wider software and AI effort behind it; Lolixco is the particular product visitors can use.`,
      },
      {
        id: 'edits',
        title: 'Why Video Edits?',
        body: `Edits connect entertainment with the decisions of the person shaping it. They can emphasize a character, build a mood, connect images across a theme, or turn a familiar scene into a different audiovisual experience. Those are useful ways to think about the medium, rather than promises that every item in the catalogue follows a particular format.

Lolixco includes edits inspired by films, series, anime and gaming. That scope makes discovery an important part of the product: a visitor may arrive with a specific interest or simply want something unexpected. The platform does not claim ownership of the underlying third-party entertainment. Copyright and content-removal inquiries have a dedicated route through [rights@golixco.com](mailto:rights@golixco.com).`,
      },
      {
        id: 'discovering-edits',
        title: 'Discovering Edits',
        body: `The initial unified catalogue launched with **57 edits: 27 YouTube-hosted and 30 Lolixco-hosted**. This is launch-catalogue information, not a permanently fixed inventory or a real-time count. It explains the starting mix of sources without making a claim about subsequent growth, audience size or viewing statistics.

Those sources can have different playback conditions. A YouTube-hosted edit depends on the availability and eligibility of its original public video. Lolixco-hosted content is delivered within the product's supported experience. A broken or unavailable video should be reported to [support@golixco.com](mailto:support@golixco.com), ideally with its URL and a short description of the issue. A discovery platform is more useful when those boundaries are easy to understand.`,
      },
      {
        id: 'home-explore-search',
        title: 'Home, Explore and Search',
        body: `Home provides an entry point into edit discovery, including Edit of the Moment. It is the place to begin when the intention is broad: see what is available and choose something to watch. [Explore](https://lol.golixco.com/explore) offers another route through the collection, while Search helps someone look for edits in the catalogue.

These modes support different intentions. Browsing leaves room for a surprise; searching begins with a question or an interest. Neither needs to become a promise about personalized recommendations, private user profiles or a particular ranking algorithm. Those capabilities have not been established as current product facts. The essential released experience is discovering available edits and moving into viewing.`,
      },
      {
        id: 'shorts-and-shuffle',
        title: 'Shorts and Shuffle',
        body: `[Shorts](https://lol.golixco.com/shorts) provides a way to browse short-form edits, with a mobile-friendly viewing experience. Shorter work changes how people explore a catalogue: it can be a quick entry point into a style, a theme or a particular creative treatment, without requiring every visit to begin with a long viewing session.

Shuffle adds randomized discovery. It offers a different starting point when a visitor does not want to make the first selection. Randomized discovery should not be confused with a claim about a personalized recommendation system or a prediction of what someone will like. The value here is simple: another way to encounter an available edit.`,
      },
      {
        id: 'edit-of-the-moment',
        title: 'Edit of the Moment',
        body: `Edit of the Moment surfaces a featured edit for discovery. It gives the homepage a visible point of focus within a wider collection: a concrete piece of work to begin with, rather than an abstract explanation of everything the platform might contain.

There is no publicly confirmed rotation schedule or selection algorithm to describe. “Featured” should not imply a paid placement, an exclusive partnership or a quantitative quality ranking. It is a named part of the current browsing experience. Visitors can use it as a starting point and continue into other available work.`,
      },
      {
        id: 'immersion',
        title: 'Immersion',
        body: `[Immersion](https://lol.golixco.com/immersion) is the focused, immersive viewing experience in Lolixco. It supports the straightforward intention to watch an edit with attention on the work. Discovery helps someone choose; Immersion provides another way to move into the viewing experience itself.

The name describes a viewing mode, rather than a promise about virtual reality, a separate application or a particular display technology. It is part of the live public beta. As with other viewing surfaces, the availability of the selected content and its playback conditions still matter.`,
      },
      {
        id: 'interface-and-identity',
        title: 'The Interface and Visual Identity',
        body: `The product sits in the same visual ecosystem as Golixco while keeping its own emphasis on video. A dark viewing environment gives bright and detailed footage room to stand out. Restrained navigation helps discovery, viewing and Creator Studio feel like recognizable parts of a single product, rather than an unrelated collection of tools.

Lolixco's approved identity combines a white mark with a warm luminous yellow accent. On the company website, that warmer amber-gold treatment appears on the Lolixco product link when it is hovered or focused. It identifies the product interaction without turning the whole company interface into a different colour system.

On mobile, the supported experience is responsive video browsing through the website. A mobile layout needs room for touch controls, legible text and clear navigation between experiences. Responsive browsing does not establish that a native iOS or Android app exists. The distinction helps visitors choose the right way to access the product today.`,
      },
      {
        id: 'creator-studio',
        title: 'Creator Studio',
        body: `[Creator Studio](https://lol.golixco.com/creator-studio) provides experimental, evidence-based feedback on an edit. Supported inputs include compatible local video uploads and eligible public YouTube URLs. Compatibility and URL eligibility matter; a description of the feature should not imply that every format, duration or public link will be accepted.

The system combines local media-signal analysis with Gemini-supported semantic understanding where available. This can connect observable properties of the media with a broader reading of its creative execution. The feedback is a way to inspect choices, rather than a guarantee that a model understands every artistic intention. A useful starting point is to compare what the assessment describes with the actual moments and patterns in the edit.`,
      },
      {
        id: 'six-analysis-dimensions',
        title: 'The Six Analysis Dimensions',
        body: `Creator Studio's assessment framework covers six dimensions. They provide different perspectives on the same work, rather than six interchangeable versions of a single quality score.

1. **Beat Synchronization / Audiovisual Rhythm** examines how well visual edits align with music, rhythm and audiovisual timing. The focus is the relationship between what is seen and what is heard.
2. **Cuts & Transitions** considers the effectiveness, precision and quality of cuts and transitions. A transition is part of how one moment becomes another, rather than an effect whose complexity alone establishes its value.
3. **Pacing** looks at how the edit maintains its rhythm, energy and flow. This is a useful perspective on progression across the work, including how changes in tempo feel over time.
4. **Visual Craftsmanship** concerns visual presentation, compositing and other supported aspects of execution quality. It draws attention to how the work is presented, within what the available analysis can support.
5. **Storytelling & Coherence** examines how the edit communicates ideas, structure, continuity and progression. A narrative can be explicit or more associative; the assessment is still experimental interpretation.
6. **Creative Execution & Impact** considers distinctiveness, creative decisions and overall impact. It is particularly important to read this as feedback rather than an objective verdict on originality or artistic worth.

Not every analysis produces all six scores. When semantic inference is unavailable, supported partial feedback may still be presented. Missing information should remain missing rather than being filled with a confident-looking invented number.`,
      },
      {
        id: 'how-ai-supports-the-experience',
        title: 'How AI Supports the Experience',
        body: `The role of AI in Creator Studio is to support examination, not to promise perfect judgment. Local media signals and semantic understanding contribute different kinds of evidence. Their combination can be useful when the explanation stays connected to what the analysis can actually observe and support.

Creative assessment has unavoidable limits. An unusual rhythm may be intentional. A quiet passage can serve a larger structure. An automated explanation can miss context or give too much weight to an easily measured property. These are reasons to use the feedback thoughtfully, compare it with the edit and keep human creative decisions central. Lolixco does not promise perfectly accurate scoring or that every analysis will return a complete six-score result.`,
      },
      {
        id: 'limitations-of-the-beta',
        title: 'Limitations of the Current Beta',
        body: `Public beta means the product is available while its experience continues to develop. Features and availability may change. Compatible inputs, eligible public URLs, source-video availability and access to semantic inference affect what can be experienced or assessed. No unverified claims about processing speed, accuracy percentages or guaranteed availability belong in that description.

Creator monetization, paid memberships, user accounts, native mobile applications, OTT partnerships and an AI Auto Editor have not been confirmed as available functionality. The six-dimensional analyzer should not be confused with an automatic editor, and a catalogue of entertainment-inspired edits should not be presented as a licensing partnership. Knowing these boundaries makes the live features easier to evaluate on their actual merits.`,
      },
      {
        id: 'our-direction',
        title: 'Our Direction',
        body: `The direction is to explore useful connections between creative software, discovery and AI-assisted understanding. The current product gives that direction a concrete form: browse edits, watch them, and optionally examine creative execution through experimental analysis. Further concepts are possibilities, not publicly committed releases or dates.

Golixco's wider philosophy is to combine software, AI and experimentation to build useful products. Lolixco is one expression of that philosophy. For the company background, brand history and approach to interfaces, read [the Golixco introduction](/blog/the-golixco-blog). The two stories belong together, while keeping the product's released functionality separate from the company's broader ambitions.`,
      },
      {
        id: 'experience-lolixco',
        title: 'Experience Lolixco',
        body: `[Open the live public beta](https://lol.golixco.com/) to begin with discovery. Try [Explore](https://lol.golixco.com/explore) if you want to browse the collection, [Shorts](https://lol.golixco.com/shorts) for short-form viewing, or [Immersion](https://lol.golixco.com/immersion) for a focused viewing experience. Visit [Creator Studio](https://lol.golixco.com/creator-studio) when you want experimental feedback on a compatible edit.

For product help, email [support@golixco.com](mailto:support@golixco.com). For copyright and removal inquiries, use [rights@golixco.com](mailto:rights@golixco.com). General company inquiries go to [hello@golixco.com](mailto:hello@golixco.com). You can also return to the [Golixco homepage](/) or explore more context in the [Golixco Blog](/blog).`,
      },
    ],
  },
];
export const articlePath = (a: Article) => `/blog/${a.slug}`;
export const canonical = (path: string) => `https://golixco.com${path === '/' ? '/' : path}`;
export function readingTime(a: Article) {
  return Math.ceil(
    a.sections
      .map((s) => s.title + ' ' + s.body.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1'))
      .join(' ')
      .split(/\s+/).length / 220,
  );
}
export const publicPaths = ['/', '/blog', ...articles.map(articlePath)];
