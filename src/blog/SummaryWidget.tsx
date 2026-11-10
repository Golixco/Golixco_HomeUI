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
  return `Read and summarize this Golixco article: ${parsed.href}. Explain its key ideas, important details and main takeaways. Distinguish factual claims from opinions and cite the article.`;
}
export function summaryServices(prompt: string) {
  return [
    { name: 'ChatGPT', icon: 'openai', url: 'https://chatgpt.com/' },
    {
      name: 'Google AI Mode',
      icon: 'google',
      url:
        'https://www.google.com/search?' +
        new URLSearchParams({ udm: '50', q: prompt }),
    },
    {
      name: 'Grok',
      icon: 'grok',
      url: 'https://grok.com/?' + new URLSearchParams({ q: prompt }),
    },
    { name: 'Claude', icon: 'claude', url: 'https://claude.ai/new' },
  ];
}
export function SummaryWidget({ url }: { url: string }) {
  const prompt = summaryPrompt(url);
  const [status, setStatus] = useState('');
  const [manual, setManual] = useState(false);
  async function copy(service?: string) {
    try {
      await navigator.clipboard.writeText(prompt);
      setStatus(
        service === 'Grok'
          ? 'Summary prompt copied. Review the prepared message in Grok and choose Send. Paste it if needed.'
          : service === 'Google AI Mode'
            ? 'Summary prompt copied. Google opens a prepared query; paste it if Google asks you to start again.'
            : `Summary prompt copied. Paste and submit it in ${service ?? 'your chosen AI service'}.`,
      );
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
        <button
          type="button"
          onClick={() => void copy()}
          aria-label="Copy summary prompt"
        >
          {status.startsWith('Summary prompt copied') ? (
            <Check size={15} />
          ) : (
            <Copy size={15} />
          )}
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
            onClick={() => void copy(service.name)}
          >
            <img
              width="20"
              height="20"
              src={`/icons/${service.icon}.svg`}
              alt=""
            />
            {service.name}
            <ArrowUpRight size={14} />
          </a>
        ))}
      </div>
      <p>
        Grok opens a message for review; Google AI Mode opens a prepared query.
        For ChatGPT and Claude, paste the copied prompt. Sign-in, app opening
        and article access depend on the service and device.
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
