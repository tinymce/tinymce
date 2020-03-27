import { assert, UnitTest } from '@ephox/bedrock-client';
import * as StringMapper from 'ephox/polaris/words/StringMapper';
import * as UnicodeData from 'ephox/polaris/words/UnicodeData';

UnitTest.test('Words.StringMapperTest', function () {
  const ci = UnicodeData.characterIndices;

  const ALETTER = ci.ALETTER;
  const MIDNUMLET = ci.MIDNUMLET;
  const MIDLETTER = ci.MIDLETTER;
  const MIDNUM = ci.MIDNUM;
  const NUMERIC = ci.NUMERIC;
  const CR = ci.CR;
  const LF = ci.LF;
  const NEWLINE = ci.NEWLINE;
  const EXTEND = ci.EXTEND;
  const FORMAT = ci.FORMAT;
  const KATAKANA = ci.KATAKANA;
  const EXTENDNUMLET = ci.EXTENDNUMLET;
  const OTHER = ci.OTHER;
  const AT = ci.AT;

  const classify = StringMapper.classify;

  const testClassify = function () {
    assert.eq([ ALETTER, ALETTER, ALETTER ], classify('abc'.split('')));
    assert.eq([ ALETTER, ALETTER, ALETTER ], classify('åäö'.split('')));
    assert.eq([ ALETTER, NUMERIC, ALETTER ], classify('a2c'.split('')));
    assert.eq([ ALETTER, MIDNUMLET, ALETTER, ALETTER, OTHER, ALETTER, ALETTER, ALETTER, ALETTER, ALETTER ], classify(`a'la carte`.split('')));
    assert.eq([ ALETTER, ALETTER, ALETTER, OTHER, LF, OTHER, ALETTER, ALETTER, ALETTER ], classify('one \n two'.split('')));
    assert.eq([ NUMERIC, MIDNUM, NUMERIC, NUMERIC, NUMERIC, MIDNUMLET, NUMERIC, NUMERIC ], classify('3,500.10'.split('')));
    assert.eq([ OTHER, KATAKANA, KATAKANA ], classify('愛ラブ'.split('')));
    assert.eq([ OTHER, OTHER ], classify('ねこ'.split('')));
    assert.eq([ MIDLETTER ], classify('·'.split('')));
    assert.eq([ EXTENDNUMLET, MIDNUMLET, MIDNUM, MIDNUM, MIDNUM, MIDNUM, EXTENDNUMLET, EXTENDNUMLET ], classify('=-+±*/⋉≥'.split('')));
    assert.eq([ CR ], classify('\r'.split('')));
    assert.eq([ EXTEND ], classify('̀'.split('')));
    assert.eq([ NEWLINE ], classify('\x0B'.split('')));
    assert.eq([ FORMAT ], classify('؃'.split('')));
    assert.eq([ EXTENDNUMLET ], classify('︴'.split('')));
    assert.eq([ AT ], classify('@'.split('')));
  };

  testClassify();
});
