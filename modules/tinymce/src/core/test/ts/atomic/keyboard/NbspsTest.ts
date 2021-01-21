import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import { normalizeNbspMiddle } from 'tinymce/core/keyboard/Nbsps';

describe('atomic.tinymce.core.keyboard.NbspsTest', () => {
  it('normalizeNbspMiddle', () => {
    assert.isEmpty(normalizeNbspMiddle(''), 'Should remain unchanged empty string');
    assert.equal(normalizeNbspMiddle('a'), 'a', 'Should remain unchanged single letter');
    assert.equal(normalizeNbspMiddle('ab'), 'ab', 'Should remain unchanged two letters');
    assert.equal(normalizeNbspMiddle('abc'), 'abc', 'Should remain unchanged three letters');
    assert.equal(normalizeNbspMiddle('\u00a0a'), '\u00a0a', 'Should remain unchanged nbsp at start');
    assert.equal(normalizeNbspMiddle('a\u00a0'), 'a\u00a0', 'Should remain unchanged nbsp at end');
    assert.equal(normalizeNbspMiddle('a\u00a0\u00a0b'), 'a\u00a0\u00a0b', 'Should remain unchanged 2 consecutive nbsps');
    assert.equal(normalizeNbspMiddle('a\u00a0 b'), 'a\u00a0 b', 'Should remain unchanged nbsp followed by space');
    assert.equal(normalizeNbspMiddle('a \u00a0b'), 'a \u00a0b', 'Should remain unchanged space followed by nbsp');
    assert.equal(normalizeNbspMiddle('a  b'), 'a  b', 'Should remain unchanged space followed by space');

    assert.equal(normalizeNbspMiddle('a\u00a0b'), 'a b', 'Should change middle nbsp to space');
    assert.equal(normalizeNbspMiddle('a\u00a0b\u00a0c'), 'a b c', 'Should change two nbsps to spaces');
  });
});
