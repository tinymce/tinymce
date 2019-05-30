import { assert, UnitTest} from '@ephox/bedrock';
import * as AutocompleteContext from 'tinymce/themes/silver/autocomplete/AutocompleteContext';

UnitTest.test('atomic - AutocompleteContext', function () {
  const testParse = function () {
    assert.eq(null, AutocompleteContext.parse('', 0, '@', 2).getOr(null));
    assert.eq(null, AutocompleteContext.parse('abc', 0, '@', 2).getOr(null));
    assert.eq(null, AutocompleteContext.parse('@abc', 0, '@', 2).getOr(null));
    assert.eq(null, AutocompleteContext.parse('@abc', 1, '@', 2).getOr(null));
    assert.eq('a', AutocompleteContext.parse('@abc', 2, '@', 2).getOr(null));
    assert.eq('abc', AutocompleteContext.parse('@abc', 40, '@', 2).getOr(null));
    assert.eq('abc', AutocompleteContext.parse('@def@abc', 40, '@', 2).getOr(null));
    assert.eq(null, AutocompleteContext.parse('@abc x', 40, '@', 2).getOr(null));
    assert.eq(null, AutocompleteContext.parse('@abc\u00a0x', 40, '@', 2).getOr(null));
    assert.eq(null, AutocompleteContext.parse('@abc\tx', 40, '@', 2).getOr(null));
    assert.eq(null, AutocompleteContext.parse('@abc\nx', 40, '@', 2).getOr(null));
    assert.eq('abc', AutocompleteContext.parse('@abc 123', 4, '@', 2).getOr(null));
  };

  testParse();
});