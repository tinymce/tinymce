import * as Arr from 'ephox/katamari/api/Arr';
import * as Obj from 'ephox/katamari/api/Obj';
import * as Unique from 'ephox/katamari/api/Unique';
import { MixedBag } from 'ephox/katamari/data/MixedBag';
import fc from 'fast-check';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import { Option } from 'ephox/katamari/api/Option';
import { tOption } from 'ephox/katamari/api/OptionInstances';

UnitTest.test('MixedBag: unit tests', () => {
  const bagger = MixedBag([ 'alpha', 'beta', 'gamma' ], [ 'oDelta', 'oEpsilon' ]);
  (() => {
    const t1 = bagger({
      alpha: 'a',
      beta: 'b',
      gamma: 'g'
    });

    Assert.eq('eq', 'a', t1.alpha());
    Assert.eq('eq', 'b', t1.beta());
    Assert.eq('eq', 'g', t1.gamma());
    Assert.eq('eq', Option.none(), t1.oDelta(), tOption());
    Assert.eq('eq', Option.none(), t1.oEpsilon(), tOption());
  })();

  (() => {
    const t1 = bagger({
      alpha: 'a',
      beta: 'b',
      gamma: 'g',
      oDelta: 'd'
    });

    Assert.eq('eq', 'a', t1.alpha());
    Assert.eq('eq', 'b', t1.beta());
    Assert.eq('eq', 'g', t1.gamma());
    Assert.eq('eq', Option.some('d'), t1.oDelta(), tOption());
    Assert.eq('eq', Option.none(), t1.oEpsilon(), tOption());
  })();

  (() => {
    const t1 = bagger({
      alpha: 'a',
      beta: 'b',
      gamma: 'g',
      oDelta: 'd',
      oEpsilon: 'e'
    });

    Assert.eq('eq', 'a', t1.alpha());
    Assert.eq('eq', 'b', t1.beta());
    Assert.eq('eq', 'g', t1.gamma());
    Assert.eq('eq', Option.some('d'), t1.oDelta(), tOption());
    Assert.eq('eq', Option.some('e'), t1.oEpsilon(), tOption());
  })();

  (() => {
    const expected = 'All required keys (alpha, beta, gamma) were not specified. Specified keys were: alpha, gamma, oDelta, oEpsilon.';
    try {
      const t1 = bagger({
        alpha: 'a',
        gamma: 'g',
        oDelta: 'd',
        oEpsilon: 'e'
      });

      Assert.fail('Expected failure.');
    } catch (err) {
      Assert.eq('eq', expected, err.message);
    }
  })();

  (() => {
    const t1 = bagger({
      alpha: 'a',
      beta: 'b',
      gamma: undefined,
      oDelta: 'd',
      oEpsilon: 'e'
    });

    Assert.eq('eq', 'a', t1.alpha());
    Assert.eq('eq', 'b', t1.beta());
    Assert.eq('eq', undefined, t1.gamma());
    Assert.eq('eq', Option.some('d'), t1.oDelta(), tOption());
    Assert.eq('eq', Option.some('e'), t1.oEpsilon(), tOption());
  })();

  (() => {
    const t1 = bagger({
      alpha: 'a',
      beta: 'b',
      gamma: undefined,
      oDelta: 'd',
      oEpsilon: undefined
    });

    Assert.eq('eq', 'a', t1.alpha());
    Assert.eq('eq', 'b', t1.beta());
    Assert.eq('eq', undefined, t1.gamma());
    Assert.eq('eq', Option.some('d'), t1.oDelta(), tOption());
    Assert.eq('eq', Option.some(undefined), t1.oEpsilon(), tOption());
  })();

  (() => {
    const expected = 'Unsupported keys for object: ghost';
    try {
      const t1 = bagger({
        alpha: 'a',
        beta: 'b',
        gamma: undefined,
        oDelta: 'd',
        oEpsilon: undefined,
        ghost: 'boo'
      });

      Assert.fail('Expected failure: ' + expected);
    } catch (err) {
      Assert.eq('eq', expected, err.message);
    }
  })();

  (() => {
    const expected = 'You must specify at least one required or optional field.';
    try {
      const bg = MixedBag([], []);

      Assert.fail('Expected failure: ' + expected);
    } catch (err) {
      Assert.eq('eq', expected, err.message);
    }
  })();

  (() => {
    const expected = 'The value 10 in the required fields was not a string.';
    try {
      const bg = MixedBag(<any> [ 10 ], []);

      Assert.fail('Expected failure: ' + expected);
    } catch (err) {
      Assert.eq('eq', expected, err.message);
    }
  })();

  (() => {
    const expected = 'The value 5 in the optional fields was not a string.';
    try {
      const bg = MixedBag([], <any> [ 5 ]);

      Assert.fail('Expected failure: ' + expected);
    } catch (err) {
      Assert.eq('eq', expected, err.message);
    }
  })();

  (() => {
    const expected = 'The required fields must be an array. Was: apple.';
    try {
      const bg = MixedBag(<any> 'apple', <any> [ 5 ]);

      Assert.fail('Expected failure: ' + expected);
    } catch (err) {
      Assert.eq('eq', expected, err.message);
    }
  })();

  (() => {
    const expected = 'The optional fields must be an array. Was: beetroot.';
    try {
      const bg = MixedBag([], <any> 'beetroot');

      Assert.fail('Expected failure: ' + expected);
    } catch (err) {
      Assert.eq('eq', expected, err.message);
    }
  })();

  (() => {
    const expected = 'The field: cat occurs more than once in the combined fields: [apple, cat, cat].';
    try {
      const bg = MixedBag([ 'cat' ], [ 'apple', 'cat' ]);

      Assert.fail('Expected failure: ' + expected);
    } catch (err) {
      Assert.eq('eq', expected, err.message);
    }
  })();
});

const genInputs = fc.array(fc.string(1, 40)).chain((rawRequired) => fc.array(fc.string(1, 40)).chain((rawExtra) => {
  const extra = Unique.stringArray(rawExtra);
  return fc.string(1, 40).map((backup) => {
    const required = rawRequired.length === 0 && extra.length === 0 ? [ backup ] : Unique.stringArray(rawRequired);
    return {
      required,
      extra: Arr.filter(extra, (e) => !Arr.contains(required, e))
    };
  });
}));

UnitTest.test('MixedBag: properties', () => {
  fc.assert(fc.property(genInputs, fc.json(), fc.func(fc.boolean()), (inputs, constant, pred) => {
    const bag = MixedBag(inputs.required, inputs.extra);
    const fields = Arr.filter(inputs.required.concat(inputs.extra), (x) => pred(x));

    const r: Record<string, any> = {};
    Arr.each(fields, (field) => {
      r[field] = constant;
    });

    const shouldPass = Arr.forall(inputs.required, (k) => r.hasOwnProperty(k));

    if (shouldPass) {
      const output = bag(r);
      const keys = Obj.keys(output);
      return Arr.forall(keys, (k) => (
        (Arr.contains(inputs.required, k) && output[k]() === r[k]) ||
        (Arr.contains(inputs.extra, k) && (
          (r.hasOwnProperty(k) && output[k]().isSome()) ||
          (!r.hasOwnProperty(k) && output[k]().isNone())
        ))
      ));
    } else {
      try {
        bag(r);
        return false;
      } catch (err) {
        if (err.message.indexOf('All required') > -1) {
          return true;
        } else {
          Assert.fail('Unexpected error: ' + err.message);
          return false;
        }
      }
    }
  }));
});
