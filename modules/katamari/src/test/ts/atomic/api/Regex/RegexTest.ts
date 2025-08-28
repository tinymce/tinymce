import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as Regex from 'ephox/katamari/api/Regex';

describe('Regex', () => {
  it('escape', () => {
    assert.equal(Regex.escape('abcd.'), 'abcd\\.', 'period, asterisc');
    assert.equal(Regex.escape('abc*d'), 'abc\\*d', 'asterisc');
    assert.equal(Regex.escape('+abcd'), '\\+abcd', 'plus');
    assert.equal(Regex.escape('?abcd'), '\\?abcd', 'Question mark');
    assert.equal(Regex.escape('^abcd'), '\\^abcd', 'Caret');
    assert.equal(Regex.escape('$abcd'), '\\$abcd', 'Dollar Sign');
    assert.equal(Regex.escape('|abcd'), '\\|abcd', 'Pipe');
    assert.equal(Regex.escape('{abcd}'), '\\{abcd\\}', 'Curly Brackets');
    assert.equal(Regex.escape('(abcd)'), '\\(abcd\\)', 'Parenthesis');
    assert.equal(Regex.escape('[abcd]'), '\\[abcd\\]', 'Square Brackets');
    assert.equal(Regex.escape('.*+?^${}()|[]'), '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]', 'All');
  });
});
