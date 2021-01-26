import { describe } from '@ephox/bedrock-client';
import { assert } from 'chai';
import * as Regex from 'ephox/katamari/api/Regex';

describe('Regex.escapeRegExp', () => {
  assert.equal('abcd\\.', Regex.escapeRegExp('abcd.'), 'period, asterisc',);
  assert.equal('abc\\*d', Regex.escapeRegExp('abc*d'), 'asterisc',);
  assert.equal('\\+abcd', Regex.escapeRegExp('+abcd'), 'plus',);
  assert.equal('\\?abcd', Regex.escapeRegExp('?abcd'), 'Question mark',);
  assert.equal('\\^abcd', Regex.escapeRegExp('^abcd'), 'Caret',);
  assert.equal('\\$abcd', Regex.escapeRegExp('$abcd'), 'Dollar Sign',);
  assert.equal('\\|abcd', Regex.escapeRegExp('|abcd'), 'Pip',);
  assert.equal('\\{abcd\\}', Regex.escapeRegExp('{abcd}'), 'Curly Brackets',);
  assert.equal('\\(abcd\\)', Regex.escapeRegExp('(abcd)'), 'Parenthesis',);
  assert.equal('\\[abcd\\]', Regex.escapeRegExp('[abcd]'), 'Square Brackets',);
  assert.equal('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]', Regex.escapeRegExp('.*+?^${}()|[]'), 'All',);
});
