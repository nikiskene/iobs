import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { NARRATIVE_MAX_LENGTH, narrativeLimitError, PRINCIPLE_IDS } from '../src/content/nominationContent';
const paragraph = readFileSync(new URL('./fixtures/dubois-nomination.txt', import.meta.url), 'utf8').trim();
assert.ok(paragraph.length > 750);
assert.equal(NARRATIVE_MAX_LENGTH, 3000);
for (const id of PRINCIPLE_IDS) {
  assert.equal(narrativeLimitError('', { [id]: paragraph }), '');
  assert.equal(narrativeLimitError('', { [id]: 'x'.repeat(3000) }), '');
  assert.match(narrativeLimitError('', { [id]: 'x'.repeat(3001) }), /3,000/);
}
assert.equal(narrativeLimitError(paragraph, {}), '');
assert.equal(narrativeLimitError('x'.repeat(3000), {}), '');
assert.match(narrativeLimitError('x'.repeat(3001), {}), /3,000/);
console.log(`Nomination validation passed; DuBois paragraph: ${paragraph.length} characters.`);
