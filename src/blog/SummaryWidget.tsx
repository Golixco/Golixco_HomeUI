import { useState } from 'react';
import { ArrowUpRight, Copy, Check } from 'lucide-react';
export function summaryPrompt(url: string) {
  const parsed = new URL(url);
  if (
    parsed.origin !== 'https://golixco.com' ||
    !/^\/blog\/[a-z0-9-]+$/.test(parsed.pathname) ||
    parsed.search ||
    parsed.hash
  )
    throw new Error('Invalid public article URL');
  return `Please read and summarize this article: ${parsed.href}. Explain the main ideas and key takeaways, distinguish confirmed facts from speculation, and cite the source article.`;
}
export function summaryServices(prompt: string) {
  return [
    { name: 'ChatGPT', icon: 'openai', url: 'https://chatgpt.com/' },
    {
      name: 'Google AI Mode',
      icon: 'google',
      url: 'https://www.google.com/search?' + new URLSearchParams({ udm: '50', q: prompt }),
    },
    { name: 'Grok', icon: 'grok', url: 'https://grok.com/' },
    { name: 'Claude', icon: 'claude', url: 'https://claude.ai/new' },
  ];
}
export function SummaryWidget({ url }: { url: string }) {
  const prompt = summaryPrompt(url);
  const [status, setStatus] = useState('');
  const [manual, setManual] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setStatus('Summary prompt copied. Paste and submit it in your chosen AI service.');
      setManual(false);
    } catch {
      setManual(true);
      setStatus('Clipboard unavailable. Select and copy the prompt below.');
    }
  }
  return (
    <section className="summary-widget" aria-label="Article summary tools">
      <div className="summary-heading">
        <h2>Summarize this article using AI</h2>
        <button type="button" onClick={() => void copy()} aria-label="Copy summary prompt">
          {status.startsWith('Summary prompt copied') ? <Check size={15} /> : <Copy size={15} />}
          <span>Copy prompt</span>
        </button>
      </div>
      <div className="summary-services">
        {summaryServices(prompt).map((service) => (
          <a
            key={service.name}
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (service.name !== 'Google AI Mode') void copy();
            }}
          >
            <img width="20" height="20" src={`/icons/${service.icon}.svg`} alt="" />
            {service.name}
            <ArrowUpRight size={14} />
          </a>
        ))}
      </div>
      <p>
        Copy the prompt, open a service, then paste and submit. Google AI Mode opens a prepared
        query. External access and article retrieval may vary.
      </p>
      {status && <p role="status">{status}</p>}
      {manual && (
        <textarea
          aria-label="Summary prompt to copy manually"
          readOnly
          value={prompt}
          onFocus={(e) => e.currentTarget.select()}
          rows={5}
        />
      )}
    </section>
  );
}
