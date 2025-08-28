import { Assert, UnitTest } from '@ephox/bedrock-client';

import * as StringMapper from 'ephox/polaris/words/StringMapper';
import * as UnicodeData from 'ephox/polaris/words/UnicodeData';

UnitTest.test('Words.StringMapperTest', () => {
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

  const testClassify = () => {
    Assert.eq('', [ ALETTER, ALETTER, ALETTER ], classify('abc'.split('')));
    Assert.eq('', [ ALETTER, ALETTER, ALETTER ], classify('åäö'.split('')));
    Assert.eq('', [ ALETTER, NUMERIC, ALETTER ], classify('a2c'.split('')));
    Assert.eq('', [ ALETTER, MIDNUMLET, ALETTER, ALETTER, OTHER, ALETTER, ALETTER, ALETTER, ALETTER, ALETTER ], classify(`a'la carte`.split('')));
    Assert.eq('', [ ALETTER, ALETTER, ALETTER, OTHER, LF, OTHER, ALETTER, ALETTER, ALETTER ], classify('one \n two'.split('')));
    Assert.eq('', [ NUMERIC, MIDNUM, NUMERIC, NUMERIC, NUMERIC, MIDNUMLET, NUMERIC, NUMERIC ], classify('3,500.10'.split('')));
    Assert.eq('', [ OTHER, KATAKANA, KATAKANA ], classify('愛ラブ'.split('')));
    Assert.eq('', [ OTHER, OTHER ], classify('ねこ'.split('')));
    Assert.eq('', [ MIDLETTER ], classify('·'.split('')));
    Assert.eq('', [ EXTENDNUMLET, MIDNUMLET, MIDNUM, MIDNUM, MIDNUM, MIDNUM, EXTENDNUMLET, EXTENDNUMLET ], classify('=-+±*/⋉≥'.split('')));
    Assert.eq('', [ CR ], classify('\r'.split('')));
    Assert.eq('', [ EXTEND ], classify('̀'.split('')));
    Assert.eq('', [ NEWLINE ], classify('\x0B'.split('')));
    Assert.eq('', [ FORMAT ], classify('؃'.split('')));
    Assert.eq('', [ EXTENDNUMLET ], classify('︴'.split('')));
    Assert.eq('', [ AT ], classify('@'.split('')));
  };

  testClassify();
});
