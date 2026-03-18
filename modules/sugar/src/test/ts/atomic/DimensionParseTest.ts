import { Assert, describe, it } from '@ephox/bedrock-client';
import { Optionals } from '@ephox/katamari';
import fc from 'fast-check';

import * as Dimension from 'ephox/sugar/api/view/Dimension';

describe('atomic.sugar.DimensionParseTest', () => {
  it('All valid floats are valid', () => {
    fc.assert(fc.property(fc.oneof(
      // small to medium floats
      fc.float({ noNaN: true, noDefaultInfinity: true }),
      // big floats
      fc.tuple(
        fc.float({ noNaN: true, noDefaultInfinity: true }),
        fc.integer({ min: -20, max: 20 })
      ).map(([ mantissa, exponent ]) => mantissa * Math.pow(10, exponent))
    ), (num) => {
      const parsed = Dimension.parse(num.toString(), [ 'empty' ]).getOrDie();
      Assert.eq('Number is unchanged by stringifying and parsing', num, parsed.value);
      Assert.eq('Unit is empty', '', parsed.unit);
      return true;
    }));
  });

  it('All valid integers are valid', () => {
    fc.assert(fc.property(fc.integer(), (num) => {
      const parsed = Dimension.parse(num.toString(), [ 'empty' ]).getOrDie();
      Assert.eq('Number is unchanged by stringifying and parsing', num, parsed.value);
      Assert.eq('Unit is empty', '', parsed.unit);
      return true;
    }));
  });

  it('Accepts known units', () => {
    Assert.succeeds('Accepts % in relative', () => Optionals.is(Dimension.parse('1%', [ 'relative' ]), { value: 1, unit: '%' as const }));
    Assert.succeeds('Accepts px in fixed', () => Optionals.is(Dimension.parse('20px', [ 'fixed' ]), { value: 20, unit: 'px' as const }));
    Assert.succeeds('Does not accept % in fixed', () => Dimension.parse('1%', [ 'fixed' ]).isNone());
    Assert.succeeds('Accepts px in fixed/relative', () => Optionals.is(Dimension.parse('20px', [ 'fixed', 'relative' ]), { value: 20, unit: 'px' as const }));
    Assert.succeeds('Accepts unitless in unitless', () => Optionals.is(Dimension.parse('1.4', [ 'empty' ]), { value: 1.4, unit: '' as const }));
    Assert.succeeds('Does not accept unitless without unitless', () => Dimension.parse('1.4', [ 'fixed', 'unsupportedLength', 'relative' ]).isNone());
  });
});
