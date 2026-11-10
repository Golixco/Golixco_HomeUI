import { renderToString } from 'react-dom/server';
import App from './App';
import BlogApp from './blog/BlogApp';
export function render(path: string) {
  return renderToString(path.startsWith('/blog') ? <BlogApp path={path} /> : <App path={path} />);
}
