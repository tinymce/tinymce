import * as Arr from 'ephox/katamari/api/Arr';
import * as Obj from 'ephox/katamari/api/Obj';
import * as Type from 'ephox/katamari/api/Type';
import * as Unique from 'ephox/katamari/api/Unique';
import { MixedBag } from 'ephox/katamari/data/MixedBag';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('MixedBagTest', function() {
  const bagger = MixedBag([ 'alpha', 'beta', 'gamma' ], [ 'oDelta', 'oEpsilon' ]);
  (function () {
    const t1 = bagger({
      alpha: 'a',
      beta: 'b',
      gamma: 'g'
    });

    assert.eq('a', t1.alpha());
    assert.eq('b', t1.beta());
    assert.eq('g', t1.gamma());
    assert.eq(true, t1.oDelta().isNone());
    assert.eq(true, t1.oEpsilon().isNone());
  })();

  (function () {
    const t1 = bagger({
      alpha: 'a',
      beta: 'b',
      gamma: 'g',
      oDelta: 'd'
    });

    assert.eq('a', t1.alpha());
    assert.eq('b', t1.beta());
    assert.eq('g', t1.gamma());
    assert.eq('d', t1.oDelta().getOrDie());
    assert.eq(true, t1.oEpsilon().isNone());
  })();

  (function () {
    const t1 = bagger({
      alpha: 'a',
      beta: 'b',
      gamma: 'g',
      oDelta: 'd',
      oEpsilon: 'e'
    });

    assert.eq('a', t1.alpha());
    assert.eq('b', t1.beta());
    assert.eq('g', t1.gamma());
    assert.eq('d', t1.oDelta().getOrDie());
    assert.eq('e', t1.oEpsilon().getOrDie());
  })();

  (function () {
    const expected = 'All required keys (alpha, beta, gamma) were not specified. Specified keys were: alpha, gamma, oDelta, oEpsilon.';
    try {
      const t1 = bagger({
        alpha: 'a',
        gamma: 'g',
        oDelta: 'd',
        oEpsilon: 'e'
      });

      assert.fail('Expected failure.');
    } catch (err) {
      assert.eq(expected, err.message);
    }      
  })();

  (function () {
    const t1 = bagger({
      alpha: 'a',
      beta: 'b',
      gamma: undefined,
      oDelta: 'd',
      oEpsilon: 'e'
    });

    assert.eq('a', t1.alpha());
    assert.eq('b', t1.beta());
    assert.eq(undefined, t1.gamma());
    assert.eq('d', t1.oDelta().getOrDie());
    assert.eq('e', t1.oEpsilon().getOrDie());
  })();

  (function () {
    const t1 = bagger({
      alpha: 'a',
      beta: 'b',
      gamma: undefined,
      oDelta: 'd',
      oEpsilon: undefined
    });

    assert.eq('a', t1.alpha());
    assert.eq('b', t1.beta());
    assert.eq(undefined, t1.gamma());
    assert.eq('d', t1.oDelta().getOrDie());
    assert.eq(undefined, t1.oEpsilon().getOrDie());
  })();

  (function () {
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

      assert.fail('Expected failure: ' + expected);
    } catch (err) {
      assert.eq(expected, err.message);
    }
  })();

  (function () {
    const expected = 'You must specify at least one required or optional field.';
    try {
      const bg = MixedBag([  ], [  ]);

      assert.fail('Expected failure: ' + expected);
    } catch (err) {
      assert.eq(expected, err.message);
    }
  })();

  (function () {
    const expected = 'The value 10 in the required fields was not a string.';
    try {
      const bg = MixedBag(<any>[ 10 ], [  ]);

      assert.fail('Expected failure: ' + expected);
    } catch (err) {
      assert.eq(expected, err.message);
    }
  })();

  (function () {
    const expected = 'The value 5 in the optional fields was not a string.';
    try {
      const bg = MixedBag([ ], <any>[ 5 ]);

      assert.fail('Expected failure: ' + expected);
    } catch (err) {
      assert.eq(expected, err.message);
    }
  })();

  (function () {
    const expected = 'The required fields must be an array. Was: apple.';
    try {
      const bg = MixedBag(<any>'apple', <any>[ 5 ]);

      assert.fail('Expected failure: ' + expected);
    } catch (err) {
      assert.eq(expected, err.message);
    }
  })();

  (function () {
    const expected = 'The optional fields must be an array. Was: beetroot.';
    try {
      const bg = MixedBag([], <any>'beetroot');

      assert.fail('Expected failure: ' + expected);
    } catch (err) {
      assert.eq(expected, err.message);
    }
  })();

  (function () {
    const expected = 'The field: cat occurs more than once in the combined fields: [apple, cat, cat].';
    try {
      const bg = MixedBag([ 'cat' ], [ 'apple', 'cat' ]);

      assert.fail('Expected failure: ' + expected);
    } catch (err) {
      assert.eq(expected, err.message);
    }
  })();

  const genInputs = Jsc.array(Jsc.nestring).generator.flatMap(function (rawRequired) {
    return Jsc.array(Jsc.nestring).generator.flatMap(function (rawExtra) {
      const extra = Unique.stringArray(rawExtra);
      return Jsc.nestring.generator.map(function (backup) {
        const required = rawRequired.length === 0 && extra.length === 0 ? [ backup ] : Unique.stringArray(rawRequired);
        return {
          required: required,
          extra: Arr.filter(extra, function (e) {
            return !Arr.contains(required, e);
          })
        };
      });
    });
  });

  const arbInputs = Jsc.bless({
    generator: genInputs
  });

  Jsc.property('Check Mixed Bag', arbInputs, Jsc.json, Jsc.fun(Jsc.bool), function (inputs, constant, pred) {
    const bag = MixedBag(inputs.required, inputs.extra);
    const fields = Arr.filter(inputs.required.concat(inputs.extra), function (x) { return pred(x); });

    const r = { };
    Arr.each(fields, function (field) {
      r[field] = constant;
    });

    const shouldPass = Arr.forall(inputs.required, function (k) {
      return r.hasOwnProperty(k);
    });

    if (shouldPass) {
      const output = bag(r);
      const keys = Obj.keys(output);
      return Arr.forall(keys, function (k) {
        return (
          (Arr.contains(inputs.required, k) && output[k]() === r[k]) || 
          (Arr.contains(inputs.extra, k) && (
            (r.hasOwnProperty(k) && output[k]().isSome()) ||
            (!r.hasOwnProperty(k) && output[k]().isNone())
          ))
        );
      });
    } else {
      try {
        bag(r);
        return false;
      } catch (err) {
        return !Jsc.eq(true, err.message.indexOf('All required') > -1) ? 'Unexpected error: ' + err.message : true;
      }
    }
  });
});

