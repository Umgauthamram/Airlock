import test from 'node:test';
import assert from 'node:assert/strict';
import { NebiusTokenFactoryClient } from './client.js';

test('NebiusClient: Model tier mappings & offline fallback generation', async () => {
  const client = new NebiusTokenFactoryClient();

  assert.equal(client.modelMap.nano, 'nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B');
  assert.equal(client.modelMap.super, 'nvidia/nemotron-3-super-120b-a12b');
  assert.equal(client.modelMap.ultra, 'nvidia/Nemotron-3-Ultra-550b-a55b');

  const nanoRes = await client.generateCompletion('nano', [
    { role: 'user', content: 'Suggest tags for tool inbox.get_email' },
  ]);
  assert.equal(nanoRes.tier, 'nano');
  assert.ok(nanoRes.usage.totalTokens > 0);
  assert.ok(nanoRes.content.includes('reads_untrusted'));

  const superRes = await client.generateCompletion('super', [
    { role: 'user', content: 'Generate code to fetch unread emails' },
  ]);
  assert.equal(superRes.tier, 'super');
  assert.ok(superRes.content.includes('tools.inbox.get_emails'));
});
