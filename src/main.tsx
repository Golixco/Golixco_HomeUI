import { StrictMode } from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
async function bootstrap() {
  const path = window.location.pathname;
  const { default: Component } = await (path.startsWith('/blog')
    ? import('./blog/BlogApp')
    : import('./App'));
  const root = document.getElementById('root')!;
  const element = (
    <StrictMode>
      <Component path={path} />
    </StrictMode>
  );
  if (root.querySelector('nav')) hydrateRoot(root, element);
  else createRoot(root).render(element);
}
void bootstrap();
