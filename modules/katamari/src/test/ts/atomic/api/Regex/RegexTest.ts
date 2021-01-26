import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as Regex from 'ephox/katamari/api/Regex';

UnitTest.test('Regex.escapeRegExp', () => {
  Assert.eq('period, asterisc', 'abcd\\.', Regex.escapeRegExp('abcd.'));
  Assert.eq('asterisc', 'abc\\*d', Regex.escapeRegExp('abc*d'));
  Assert.eq('plus', '\\+abcd', Regex.escapeRegExp('+abcd'));
  Assert.eq('Question mark', '\\?abcd', Regex.escapeRegExp('?abcd'));
  Assert.eq('Caret', '\\^abcd', Regex.escapeRegExp('^abcd'));
  Assert.eq('Dollar Sign', '\\$abcd', Regex.escapeRegExp('$abcd'));
  Assert.eq('Pip', '\\|abcd', Regex.escapeRegExp('|abcd'));
  Assert.eq('Curly Brackets', '\\{abcd\\}', Regex.escapeRegExp('{abcd}'));
  Assert.eq('Parenthesis', '\\(abcd\\)', Regex.escapeRegExp('(abcd)'));
  Assert.eq('Square Brackets', '\\[abcd\\]', Regex.escapeRegExp('[abcd]'));
  Assert.eq('All', '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]', Regex.escapeRegExp('.*+?^${}()|[]'));
});
