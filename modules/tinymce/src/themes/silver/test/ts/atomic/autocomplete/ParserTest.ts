import { assert, UnitTest } from '@ephox/bedrock-client';
import * as AutocompleteContext from 'tinymce/themes/silver/autocomplete/AutocompleteContext';

UnitTest.test('atomic - AutocompleteContext', () => {
  const testFindChar = () => {
    assert.eq(-1, AutocompleteContext.findChar('', 0, '@').getOr(null));
    assert.eq(-1, AutocompleteContext.findChar('abc', 0, '@').getOr(null));
    assert.eq(-1, AutocompleteContext.findChar('@abc', 0, '@').getOr(null));
    assert.eq(0, AutocompleteContext.findChar('@abc', 2, '@').getOr(null));
    assert.eq(0, AutocompleteContext.findChar('@abc', 40, '@').getOr(null));
    // Multiple chars
    assert.eq(4, AutocompleteContext.findChar('@def@abc', 40, '@').getOr(null));
    assert.eq(0, AutocompleteContext.findChar('@def@abc', 4, '@').getOr(null));
    // Whitespace
    assert.eq(null, AutocompleteContext.findChar('@abc x', 40, '@').getOr(null));
    assert.eq(null, AutocompleteContext.findChar('@abc\u00a0x', 40, '@').getOr(null));
    assert.eq(null, AutocompleteContext.findChar('@abc\tx', 40, '@').getOr(null));
    assert.eq(null, AutocompleteContext.findChar('@abc\nx', 40, '@').getOr(null));
    assert.eq(0, AutocompleteContext.findChar('@abc 123', 4, '@').getOr(null));
    // Fake caret
    assert.eq(0, AutocompleteContext.findChar('@abc\uFFEFx', 40, '@').getOr(null));
  };

  testFindChar();
});
