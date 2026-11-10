import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createServer } from 'node:http';
import { once } from 'node:events';

test('standalone Node function bundle includes knowledge and serves without a source-tree cwd', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'golixco-function-'));
  const outfile = join(folder, 'chat.mjs');
  try {
    const result = await build({
      entryPoints: ['api/chat.ts'],
      bundle: true,
      platform: 'node',
      format: 'esm',
      outfile,
      metafile: true,
      banner: {
        js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
      },
    });
    assert.ok(
      Object.keys(result.metafile!.inputs).some((path) => path.endsWith('api/knowledge.json')),
    );
    const { default: handler } = await import(pathToFileURL(outfile).href);
    const server = createServer(handler);
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    try {
      const address = server.address();
      assert.ok(address && typeof address !== 'string');
      const original = process.cwd();
      process.chdir(folder);
      try {
        const r = await fetch(`http://127.0.0.1:${address.port}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'How many edits launched on Lolixco?' }),
        });
        assert.equal(r.status, 200);
        assert.match(await r.text(), /57 edits: 27 YouTube.hosted and 30 Lolixco.hosted/);
      } finally {
        process.chdir(original);
      }
    } finally {
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
});
