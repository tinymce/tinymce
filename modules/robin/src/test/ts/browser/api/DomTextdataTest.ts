import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';
import { SugarElement } from '@ephox/sugar';

import * as DomTextdata from 'ephox/robin/api/dom/DomTextdata';

UnitTest.test('DomTextdataTest', () => {
  const a = SugarElement.fromText('alpha');
  const b = SugarElement.fromText(' beta');
  const c = SugarElement.fromText('');
  const d = SugarElement.fromText(' ');
  const e = SugarElement.fromText('epsilon');
  const f = SugarElement.fromText('foo');

  const check = (expected: { text: string; cursor: Optional<number> }, elements: SugarElement[], current: SugarElement, offset: number) => {
    const actual = DomTextdata.from(elements, current, offset);
    Assert.eq('eq', expected.text, actual.text);

    KAssert.eqOptional('eq', expected.cursor, actual.cursor);
  };

  check({
    text: '',
    cursor: Optional.some(0)
  }, [ c ], c, 0);

  check({
    text: 'alpha beta epsilonfoo',
    cursor: Optional.some(13)
  }, [ a, b, c, d, e, f ], e, 2);
});
