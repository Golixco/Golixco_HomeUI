/** Company destinations audited 2026-11-10. Exact URLs also constrain assistant links. */
export const socials = [
  { name: 'X', url: 'https://x.com/Golixco' },
  { name: 'Instagram', url: 'https://www.instagram.com/golixco/' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/company/golixco/' },
  { name: 'Reddit', url: 'https://www.reddit.com/r/Golixco/' },
  { name: 'Telegram', url: 'https://t.me/GolixcoAI' },
  { name: 'Discord', url: 'https://discord.gg/RcsYSqh7bK' },
  { name: 'GitHub', url: 'https://github.com/GolixcoAI' },
  { name: 'Facebook', url: 'https://www.facebook.com/people/Golixco/61591436109259/' },
  { name: 'Threads', url: 'https://www.threads.com/@golixco' },
  { name: 'DEV', url: 'https://dev.to/golixco' },
  { name: 'Bluesky', url: 'https://bsky.app/profile/golixco.com' },
] as const;
export const contacts = {
  general: 'hello@golixco.com',
  support: 'support@golixco.com',
  rights: 'rights@golixco.com',
};
export const productLinks = {
  home: 'https://lol.golixco.com/',
  explore: 'https://lol.golixco.com/explore',
  shorts: 'https://lol.golixco.com/shorts',
  studio: 'https://lol.golixco.com/creator-studio',
  immersion: 'https://lol.golixco.com/immersion',
  help: 'https://lol.golixco.com/help',
  beta: 'https://lol.golixco.com/beta',
  rights: 'https://lol.golixco.com/rights',
};
const approvedLinks = new Set<string>([
  'https://golixco.com/',
  ...socials.map((s) => s.url),
  ...Object.values(productLinks),
  ...Object.values(contacts).map((email) => `mailto:${email}`),
]);
export function safeOfficialLink(value: string): string | undefined {
  // No query strings, credentials, arbitrary subdomains, protocols or redirected lookalikes.
  if (approvedLinks.has(value)) return value;
  if (/^https:\/\//.test(value)) {
    try {
      const url = new URL(value);
      const canonical = url.href.replace(/\/$/, '');
      if ([...approvedLinks].some((link) => link.replace(/\/$/, '') === canonical)) return url.href;
    } catch {
      /* Invalid links become plain text. */
    }
  }
  return undefined;
}
