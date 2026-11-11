import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getLocalAnswer, REDIRECT, type ChatMessage } from '../server/knowledge.ts';
import { blogLinks } from '../shared/official.ts';

const productHistory: ChatMessage[] = [
  { role: 'user', text: 'Compare Lolixco’s Immersion mode and Creator Studio in detail.' },
];

test('answers the reported Lolixco branding question with and without history', () => {
  for (const history of [[], productHistory]) {
    const answer = getLocalAnswer('why yellow on lol?', history);
    assert.match(answer ?? '', /white mark.*yellow accent/);
    assert.ok(answer?.includes(blogLinks.product));
  }
  assert.match(getLocalAnswer('why yellow?', productHistory) ?? '', /yellow accent/);
});

test('routes broad company references and compound follow-ups to the grounded model', () => {
  assert.equal(getLocalAnswer('How does the platform fit into your wider goals?'), undefined);
  assert.equal(getLocalAnswer('What else should a first-time visitor know?', productHistory), undefined);
  assert.equal(
    getLocalAnswer('What is Golixco and what is Lolixco?'),
    undefined,
  );
  assert.equal(getLocalAnswer('What is the capital of Japan?', productHistory), REDIRECT);
});
