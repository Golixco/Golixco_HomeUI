import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, ArrowUpRight, ArrowRight } from 'lucide-react';
import { NotFound } from '../components/NotFound';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import {
  articles,
  articlePath,
  canonical,
  readingTime,
  type Article,
} from './articles';
import { SummaryWidget } from './SummaryWidget';

function Toc({ article, active }: { article: Article; active: string }) {
  return (
    <nav aria-label="Article sections">
      {article.sections.map((s) => (
        <a
          key={s.id}
          href={'#' + s.id}
          aria-current={active === s.id ? 'location' : undefined}
          className={active === s.id ? 'active' : ''}
        >
          {s.title}
        </a>
      ))}
    </nav>
  );
}
function ArticlePage({ article }: { article: Article }) {
  const [active, setActive] = useState(article.sections[0].id);
  useEffect(() => {
    const headings = article.sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));
    const update = () => {
      let current = headings[0]?.id;
      for (const el of headings) {
        if (el.getBoundingClientRect().top <= 155) current = el.id;
      }
      if (current) setActive(current);
    };
    const hash = () => {
      let id = '';
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return;
      }
      const el = document.getElementById(id);
      if (el) {
        // Stop any native smooth scroll started before fonts/hydration settled.
        const root = document.documentElement;
        const previous = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        window.scrollTo({
          top: window.scrollY + el.getBoundingClientRect().top - 115,
          behavior: 'instant',
        });
        root.style.scrollBehavior = previous;
        setActive(id);
      }
    };
    const observer = new IntersectionObserver(update, {
      rootMargin: '-100px 0px -55% 0px',
      threshold: [0, 1],
    });
    headings.forEach((h) => observer.observe(h));
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (!cancelled) hash();
    });
    const timer = setTimeout(hash, 350);
    window.addEventListener('hashchange', hash);
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      cancelled = true;
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener('hashchange', hash);
      window.removeEventListener('scroll', update);
    };
  }, [article]);
  return (
    <main id="main-content" className="article-page editorial-shell">
      <div className="article-grid">
        <article>
          <a className="back-link" href="/blog">
            <ArrowLeft size={14} />
            All stories
          </a>
          <nav aria-label="Breadcrumb" className="article-breadcrumb">
            <a href="/">Golixco</a>
            <span>/</span>
            <a href="/blog">Blog</a>
            <span>/</span>
            <span aria-current="page">{article.category.split(' / ')[0]}</span>
          </nav>
          <p className="eyebrow">{article.category}</p>
          <h1>{article.title}</h1>
          <p className="article-deck">{article.description}</p>
          <div className="article-meta">
            <span>Golixco editorial</span>
            <span>
              {readingTime(article)} min read · Edited{' '}
              {article.modified.split('-').reverse().join(' / ')}
            </span>
          </div>
          <p className="editorial-note">
            {article.published ? (
              <>
                Published{' '}
                <time dateTime={article.published}>
                  {article.published.split('-').reverse().join(' / ')}
                </time>{' '}
                · Golixco editorial
              </>
            ) : (
              'Publication date pending · Prepared for the Golixco Blog'
            )}
          </p>
          <img
            className="article-cover"
            src={article.cover}
            alt={article.coverAlt}
            width="1200"
            height="630"
            fetchPriority="high"
          />
          <SummaryWidget url={canonical(articlePath(article))} />
          <details className="mobile-toc">
            <summary>On this page</summary>
            <Toc article={article} active={active} />
          </details>
          <div className="article-body">
            {article.sections.map((section) => (
              <section key={section.id} aria-labelledby={section.id}>
                <h2 id={section.id}>
                  <a href={'#' + section.id}>{section.title}</a>
                </h2>
                <ReactMarkdown
                  skipHtml
                  components={{
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target={
                          href?.startsWith('https:') ? '_blank' : undefined
                        }
                        rel={
                          href?.startsWith('https:')
                            ? 'noopener noreferrer'
                            : undefined
                        }
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {section.body}
                </ReactMarkdown>
              </section>
            ))}
          </div>
          <div className="article-closing">
            <span className="eyebrow">Continue reading</span>
            {articles
              .filter((a) => a.slug !== article.slug)
              .map((a) => (
                <a key={a.slug} href={articlePath(a)}>
                  {a.title}
                  <ArrowRight size={20} />
                </a>
              ))}
          </div>
        </article>
        <aside className="desktop-toc">
          <p className="eyebrow">On this page</p>
          <Toc article={article} active={active} />
          <a className="toc-home" href="/blog">
            Golixco | Blog <ArrowUpRight size={13} />
          </a>
        </aside>
      </div>
    </main>
  );
}
function BlogIndex() {
  return (
    <main id="main-content" className="blog-index editorial-shell">
      <header>
        <p className="eyebrow">Ideas / Products / Perspectives</p>
        <h1>Blogs</h1>
        <p>
          The thinking behind what we build.
          <br />
          Company perspectives, product stories, and a closer look at the craft.
        </p>
      </header>
      <div className="index-divider">
        <span>Latest stories</span>
        <span>01 — 02</span>
      </div>
      <div className="article-cards">
        {articles.map((article, i) => (
          <article key={article.slug}>
            <a href={articlePath(article)} className="article-card">
              <div className="card-cover">
                <img
                  src={article.cover}
                  alt={article.coverAlt}
                  width="1200"
                  height="630"
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                />
                <span className="card-arrow">
                  <ArrowUpRight size={22} />
                </span>
              </div>
              <div className="card-meta">
                <span>{article.category}</span>
                <span>{readingTime(article)} min read</span>
              </div>
              <h2>{article.title}</h2>
              <p>{article.description}</p>
              <span className="read-story">
                Read the story <ArrowRight size={15} />
              </span>
            </a>
          </article>
        ))}
      </div>
      <div className="blog-signoff">
        <p>Built with curiosity. Explained with care.</p>
        <a href="/#about">
          Meet Golixco <ArrowUpRight size={16} />
        </a>
      </div>
    </main>
  );
}
export default function BlogApp({ path }: { path: string }) {
  const article = articles.find((a) => articlePath(a) === path);
  if (path !== '/blog' && !article) return <NotFound />;
  return (
    <div className="blog-layout">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      {article ? <ArticlePage article={article} /> : <BlogIndex />}
      <Footer showRss />
    </div>
  );
}
