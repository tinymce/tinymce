import StringMapper from 'tinymce/plugins/wordcount/text/StringMapper';
import UnicodeData from 'tinymce/plugins/wordcount/text/UnicodeData';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('atomic.core.StringMapperTest', function () {
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
    assert.eq([ALETTER, ALETTER, ALETTER], classify('abc'));
    assert.eq([ALETTER, ALETTER, ALETTER], classify('åäö'));
    assert.eq([ALETTER, NUMERIC, ALETTER], classify('a2c'));
    assert.eq([ALETTER, MIDNUMLET, ALETTER, ALETTER, OTHER, ALETTER, ALETTER, ALETTER, ALETTER, ALETTER], classify('a\'la carte'));
    assert.eq([ALETTER, ALETTER, ALETTER, OTHER, LF, OTHER, ALETTER, ALETTER, ALETTER], classify('one \n two'));
    assert.eq([NUMERIC, MIDNUM, NUMERIC, NUMERIC, NUMERIC, MIDNUMLET, NUMERIC, NUMERIC], classify('3,500.10'));
    assert.eq([OTHER, KATAKANA, KATAKANA], classify('愛ラブ'));
    assert.eq([OTHER, OTHER], classify('ねこ'));
    assert.eq([MIDLETTER], classify('·'));
    assert.eq([EXTENDNUMLET, MIDNUMLET, MIDNUM, MIDNUM, MIDNUM, EXTENDNUMLET, EXTENDNUMLET], classify('=-+*/⋉≥'));
    assert.eq([CR], classify('\r'));
    assert.eq([EXTEND], classify('̀'));
    assert.eq([NEWLINE], classify('\x0B'));
    assert.eq([FORMAT], classify('؃'));
    assert.eq([EXTENDNUMLET], classify('︴'));
    assert.eq([AT], classify('@'));
  };

  testClassify();
});
