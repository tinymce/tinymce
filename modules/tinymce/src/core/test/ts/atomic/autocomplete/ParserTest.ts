import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import { findTrigger } from 'tinymce/core/autocomplete/AutocompleteContext';

describe('atomic.tinymce.core.autocomplete.AutocompleteContext', () => {
  it('should find the one char trigger', () => {
    assert.equal(findTrigger('', 0, '@').getOr(null), -1);
    assert.equal(findTrigger('abc', 0, '@').getOr(null), -1);
    assert.equal(findTrigger('@abc', 0, '@').getOr(null), -1);
    assert.equal(findTrigger('@abc', 2, '@').getOr(null), 0);
    assert.equal(findTrigger('@abc', 40, '@').getOr(null), 0);
    // Multiple trigger entries
    assert.equal(findTrigger('@def@abc', 40, '@').getOr(null), 4);
    assert.equal(findTrigger('@def@abc', 4, '@').getOr(null), 0);
    // Whitespace
    assert.equal(findTrigger('@abc x', 40, '@').getOr(null), null);
    assert.equal(findTrigger('@abc\u00a0x', 40, '@').getOr(null), null);
    assert.equal(findTrigger('@abc\tx', 40, '@').getOr(null), null);
    assert.equal(findTrigger('@abc\nx', 40, '@').getOr(null), null);
    assert.equal(findTrigger('@abc 123', 4, '@').getOr(null), 0);
    // Fake caret
    assert.equal(findTrigger('@abc\uFFEFx', 40, '@').getOr(null), 0);
  });

  it(' should find the multi-char trigger', () => {
    assert.equal(findTrigger('', 0, '@@').getOr(null), -1);
    assert.equal(findTrigger('abc', 0, '@@').getOr(null), -1);
    assert.equal(findTrigger('@@abc', 0, '@@').getOr(null), -1);
    assert.equal(findTrigger('@@abc', 2, '@@').getOr(null), 0);
    assert.equal(findTrigger('@@abc', 40, '@@').getOr(null), 0);
    // Multiple trigger entries
    assert.equal(findTrigger('@@def@@abc', 40, '@@').getOr(null), 5);
    assert.equal(findTrigger('@@def@@abc', 5, '@@').getOr(null), 0);
    // Whitespace
    assert.equal(findTrigger('@@abc x', 40, '@@').getOr(null), null);
    assert.equal(findTrigger('@@abc\u00a0x', 40, '@@').getOr(null), null);
    assert.equal(findTrigger('@@abc\tx', 40, '@@').getOr(null), null);
    assert.equal(findTrigger('@@abc\nx', 40, '@@').getOr(null), null);
    assert.equal(findTrigger('@@abc 123', 5, '@@').getOr(null), 0);
    assert.equal(findTrigger('abc @@@123', 40, '@@@').getOr(null), 4);
    // Fake caret
    assert.equal(findTrigger('@@abc\uFFEFx', 40, '@@').getOr(null), 0);
  });
});
