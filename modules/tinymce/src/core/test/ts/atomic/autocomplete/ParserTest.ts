import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as AutocompleteContext from 'tinymce/core/autocomplete/AutocompleteContext';

describe('atomic.tinymce.core.autocomplete.AutocompleteContext', () => {
  it('should find the one char trigger', () => {
    assert.equal(AutocompleteContext.findTrigger('', 0, '@').getOr(null), -1);
    assert.equal(AutocompleteContext.findTrigger('abc', 0, '@').getOr(null), -1);
    assert.equal(AutocompleteContext.findTrigger('@abc', 0, '@').getOr(null), -1);
    assert.equal(AutocompleteContext.findTrigger('@abc', 2, '@').getOr(null), 0);
    assert.equal(AutocompleteContext.findTrigger('@abc', 40, '@').getOr(null), 0);
    // Multiple trigger entries
    assert.equal(AutocompleteContext.findTrigger('@def@abc', 40, '@').getOr(null), 4);
    assert.equal(AutocompleteContext.findTrigger('@def@abc', 4, '@').getOr(null), 0);
    // Whitespace
    assert.equal(AutocompleteContext.findTrigger('@abc x', 40, '@').getOr(null), null);
    assert.equal(AutocompleteContext.findTrigger('@abc\u00a0x', 40, '@').getOr(null), null);
    assert.equal(AutocompleteContext.findTrigger('@abc\tx', 40, '@').getOr(null), null);
    assert.equal(AutocompleteContext.findTrigger('@abc\nx', 40, '@').getOr(null), null);
    assert.equal(AutocompleteContext.findTrigger('@abc 123', 4, '@').getOr(null), 0);
    // Fake caret
    assert.equal(AutocompleteContext.findTrigger('@abc\uFFEFx', 40, '@').getOr(null), 0);
  });

  it(' should find the multi-char trigger', () => {
    assert.equal(AutocompleteContext.findTrigger('', 0, '@@').getOr(null), -1);
    assert.equal(AutocompleteContext.findTrigger('abc', 0, '@@').getOr(null), -1);
    assert.equal(AutocompleteContext.findTrigger('@@abc', 0, '@@').getOr(null), -1);
    assert.equal(AutocompleteContext.findTrigger('@@abc', 2, '@@').getOr(null), 0);
    assert.equal(AutocompleteContext.findTrigger('@@abc', 40, '@@').getOr(null), 0);
    // Multiple trigger entries
    assert.equal(AutocompleteContext.findTrigger('@@def@@abc', 40, '@@').getOr(null), 5);
    assert.equal(AutocompleteContext.findTrigger('@@def@@abc', 5, '@@').getOr(null), 0);
    // Whitespace
    assert.equal(AutocompleteContext.findTrigger('@@abc x', 40, '@@').getOr(null), null);
    assert.equal(AutocompleteContext.findTrigger('@@abc\u00a0x', 40, '@@').getOr(null), null);
    assert.equal(AutocompleteContext.findTrigger('@@abc\tx', 40, '@@').getOr(null), null);
    assert.equal(AutocompleteContext.findTrigger('@@abc\nx', 40, '@@').getOr(null), null);
    assert.equal(AutocompleteContext.findTrigger('@@abc 123', 5, '@@').getOr(null), 0);
    assert.equal(AutocompleteContext.findTrigger('abc @@@123', 40, '@@@').getOr(null), 4);
    // Fake caret
    assert.equal(AutocompleteContext.findTrigger('@@abc\uFFEFx', 40, '@@').getOr(null), 0);
  });
});
