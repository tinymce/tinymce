import { Assert, UnitTest } from '@ephox/bedrock-client';
import { KAssert } from '@ephox/katamari-assertions';
import * as Dimension from 'ephox/katamari/api/Dimension';
import fc from 'fast-check';

// @ts-ignore
window.foobar = Dimension.parse;

UnitTest.test('All valid floats are valid', () => {
  fc.assert(fc.property(fc.oneof(
    // small to medium floats
    fc.float(),
    // big floats
    fc.tuple(fc.float(), fc.integer(-20, 20)).map(([ mantissa, exponent ]) => mantissa * Math.pow(10, exponent))
  ), (num) => {
    const parsed = Dimension.parse(num.toString(), [ 'empty' ]).getOrDie();
    Assert.eq('Number is unchanged by stringifying and parsing', num, parsed.value);
    Assert.eq('Unit is empty', '', parsed.unit)
    return true;
  }))
})

UnitTest.test('All valid integers are valid', () => {
  fc.assert(fc.property(fc.integer(), (num) => {
    const parsed = Dimension.parse(num.toString(), [ 'empty' ]).getOrDie();
    Assert.eq('Number is unchanged by stringifying and parsing', num, parsed.value);
    Assert.eq('Unit is empty', '', parsed.unit);
    return true;
  }))
})

UnitTest.test('Accepts known units', () => {
  KAssert.eqSome('Accepts % in percentage', { value: 1, unit: '%' }, Dimension.parse('1%', [ 'percentage' ]));
  KAssert.eqSome('Accepts px in length', { value: 20, unit: 'px' }, Dimension.parse('20px', [ 'length' ]));
  KAssert.eqNone('Does not accept % in length', Dimension.parse('1%', [ 'length' ]));
  KAssert.eqSome('Accepts px in length/percentage', { value: 20, unit: 'px' }, Dimension.parse('20px', [ 'length', 'percentage' ]));
  KAssert.eqSome('Accepts unitless in unitless', { value: 1.4, unit: '' }, Dimension.parse('1.4', [ 'empty' ]));
  KAssert.eqNone('Does not accept unitless without unitless', Dimension.parse('1.4', [ 'length', 'unsupportedLength', 'percentage' ]))
})
