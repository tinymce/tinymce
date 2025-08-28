import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Strings from 'ephox/katamari/api/Strings';

describe('atomic.katamari.api.str.TrimTest', () => {
  it('unit tests', () => {
    const check = (expectedL: string, expectedR: string, expected: string, input: string) => {
      assert.equal(Strings.trim(input), expected);
      assert.equal(Strings.lTrim(input), expectedL);
      assert.equal(Strings.rTrim(input), expectedR);
    };

    check('', '', '', '');
    check('', '', '', ' ');
    check('', '', '', '  ');
    check('a', 'a', 'a', 'a');
    check('a ', 'a', 'a', 'a ');
    check('a', ' a', 'a', ' a');
    check('a ', ' a', 'a', ' a ');
    check('a      ', '    a', 'a', '    a      ');
    check('a    b  cd  ', '    a    b  cd', 'a    b  cd', '    a    b  cd  ');
  });

  it('leftTrim(whitespace + s) === leftTrim(s)', () => {
    fc.assert(fc.property(
      fc.string(),
      (s) => {
        assert.equal(Strings.lTrim(s), Strings.lTrim(' ' + s));
      }
    ));
  });

  it('rightTrim(s + whitespace) === rightTrim(s)', () => {
    fc.assert(fc.property(
      fc.string(),
      (s) => {
        assert.equal(Strings.rTrim(s), Strings.rTrim(s + ' '));
      }
    ));
  });

  it('trim(whitespace + s) === trim(s)', () => {
    fc.assert(fc.property(
      fc.string(),
      (s) => {
        assert.equal(Strings.trim(s), Strings.trim(' ' + s));
      }
    ));
  });

  it('trim(s + whitespace) === trim(s)', () => {
    fc.assert(fc.property(
      fc.string(),
      (s) => {
        assert.equal(Strings.trim(s), Strings.trim(s + ' '));
      }
    ));
  });

  it('trim(whitespace + s + whitespace) === trim(s)', () => {
    fc.assert(fc.property(
      fc.string(),
      (s) => {
        assert.equal(Strings.trim(s), Strings.trim(' ' + s + ' '));
      }
    ));
  });
});
