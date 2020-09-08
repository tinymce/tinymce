import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import * as Dimension from 'ephox/katamari/api/Dimension';

UnitTest.test('All valid floats are valid', () => {
  fc.assert(fc.property(fc.oneof(
    // small to medium floats
    fc.float(),
    // big floats
    fc.tuple(fc.float(), fc.integer(-20, 20)).map(([ mantissa, exponent ]) => mantissa * Math.pow(10, exponent))
  ), (num) => {
    const parsed = Dimension.parse(num.toString(), [ 'empty' ]).getOrDie();
    Assert.eq('Number is unchanged by stringifying and parsing', num, parsed.value);
    Assert.eq('Unit is empty', '', parsed.unit);
    return true;
  }));
});

UnitTest.test('All valid integers are valid', () => {
  fc.assert(fc.property(fc.integer(), (num) => {
    const parsed = Dimension.parse(num.toString(), [ 'empty' ]).getOrDie();
    Assert.eq('Number is unchanged by stringifying and parsing', num, parsed.value);
    Assert.eq('Unit is empty', '', parsed.unit);
    return true;
  }));
});

UnitTest.test('Accepts known units', () => {
  Assert.succeeds('Accepts % in percentage', () => Dimension.parse('1%', [ 'percentage' ]).is({ value: 1, unit: '%' }));
  Assert.succeeds('Accepts px in length', () => Dimension.parse('20px', [ 'length' ]).is({ value: 20, unit: 'px' }));
  Assert.succeeds('Does not accept % in length', () => Dimension.parse('1%', [ 'length' ]).isNone());
  Assert.succeeds('Accepts px in length/percentage', () => Dimension.parse('20px', [ 'length', 'percentage' ]).is({ value: 20, unit: 'px' }));
  Assert.succeeds('Accepts unitless in unitless', () => Dimension.parse('1.4', [ 'empty' ]).is({ value: 1.4, unit: '' }));
  Assert.succeeds('Does not accept unitless without unitless', () => Dimension.parse('1.4', [ 'length', 'unsupportedLength', 'percentage' ]).isNone());
});
