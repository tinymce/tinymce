import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as AutocompleteContext from 'tinymce/themes/silver/autocomplete/AutocompleteContext';

describe('atomic.tinymce.themes.silver.autocomplete.AutocompleteContext', () => {
  it('findChar', () => {
    assert.equal(AutocompleteContext.findChar('', 0, '@').getOr(null), -1);
    assert.equal(AutocompleteContext.findChar('abc', 0, '@').getOr(null), -1);
    assert.equal(AutocompleteContext.findChar('@abc', 0, '@').getOr(null), -1);
    assert.equal(AutocompleteContext.findChar('@abc', 2, '@').getOr(null), 0);
    assert.equal(AutocompleteContext.findChar('@abc', 40, '@').getOr(null), 0);
    // Multiple chars
    assert.equal(AutocompleteContext.findChar('@def@abc', 40, '@').getOr(null), 4);
    assert.equal(AutocompleteContext.findChar('@def@abc', 4, '@').getOr(null), 0);
    // Whitespace
    assert.equal(AutocompleteContext.findChar('@abc x', 40, '@').getOr(null), null);
    assert.equal(AutocompleteContext.findChar('@abc\u00a0x', 40, '@').getOr(null), null);
    assert.equal(AutocompleteContext.findChar('@abc\tx', 40, '@').getOr(null), null);
    assert.equal(AutocompleteContext.findChar('@abc\nx', 40, '@').getOr(null), null);
    assert.equal(AutocompleteContext.findChar('@abc 123', 4, '@').getOr(null), 0);
    // Fake caret
    assert.equal(AutocompleteContext.findChar('@abc\uFFEFx', 40, '@').getOr(null), 0);
  });
});
