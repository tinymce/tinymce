import Arr from 'ephox/katamari/api/Arr';
import Obj from 'ephox/katamari/api/Obj';
import Type from 'ephox/katamari/api/Type';
import Unique from 'ephox/katamari/api/Unique';
import MixedBag from 'ephox/katamari/data/MixedBag';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('MixedBagTest', function() {
  var bagger = MixedBag([ 'alpha', 'beta', 'gamma' ], [ 'oDelta', 'oEpsilon' ]);
  (function () {
    var t1 = bagger({
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
    var t1 = bagger({
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
    var t1 = bagger({
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
    var expected = 'All required keys (alpha, beta, gamma) were not specified. Specified keys were: alpha, gamma, oDelta, oEpsilon.';
    try {
      var t1 = bagger({
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
    var t1 = bagger({
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
    var t1 = bagger({
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
    var expected = 'Unsupported keys for object: ghost';
    try {
      var t1 = bagger({
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
    var expected = 'You must specify at least one required or optional field.';
    try {
      var bg = MixedBag([  ], [  ]);

      assert.fail('Expected failure: ' + expected);
    } catch (err) {
      assert.eq(expected, err.message);
    }
  })();

  (function () {
    var expected = 'The value 10 in the required fields was not a string.';
    try {
      var bg = MixedBag(<any>[ 10 ], [  ]);

      assert.fail('Expected failure: ' + expected);
    } catch (err) {
      assert.eq(expected, err.message);
    }
  })();

  (function () {
    var expected = 'The value 5 in the optional fields was not a string.';
    try {
      var bg = MixedBag([ ], <any>[ 5 ]);

      assert.fail('Expected failure: ' + expected);
    } catch (err) {
      assert.eq(expected, err.message);
    }
  })();

  (function () {
    var expected = 'The required fields must be an array. Was: apple.';
    try {
      var bg = MixedBag(<any>'apple', <any>[ 5 ]);

      assert.fail('Expected failure: ' + expected);
    } catch (err) {
      assert.eq(expected, err.message);
    }
  })();

  (function () {
    var expected = 'The optional fields must be an array. Was: beetroot.';
    try {
      var bg = MixedBag([], <any>'beetroot');

      assert.fail('Expected failure: ' + expected);
    } catch (err) {
      assert.eq(expected, err.message);
    }
  })();

  (function () {
    var expected = 'The field: cat occurs more than once in the combined fields: [apple, cat, cat].';
    try {
      var bg = MixedBag([ 'cat' ], [ 'apple', 'cat' ]);

      assert.fail('Expected failure: ' + expected);
    } catch (err) {
      assert.eq(expected, err.message);
    }
  })();

  var genInputs = Jsc.array(Jsc.nestring).generator.flatMap(function (rawRequired) {
    return Jsc.array(Jsc.nestring).generator.flatMap(function (rawExtra) {
      var extra = Unique.stringArray(rawExtra);
      return Jsc.nestring.generator.map(function (backup) {
        var required = rawRequired.length === 0 && extra.length === 0 ? [ backup ] : Unique.stringArray(rawRequired);
        return {
          required: required,
          extra: Arr.filter(extra, function (e) {
            return !Arr.contains(required, e);
          })
        };
      });
    });
  });

  var arbInputs = Jsc.bless({
    generator: genInputs
  });

  Jsc.property('Check Mixed Bag', arbInputs, Jsc.json, Jsc.fun(Jsc.bool), function (inputs, constant, pred) {
    var bag = MixedBag(inputs.required, inputs.extra);
    var fields = Arr.filter(inputs.required.concat(inputs.extra), function (x) { return pred(x); });

    var r = { };
    Arr.each(fields, function (field) {
      r[field] = constant;
    });

    var shouldPass = Arr.forall(inputs.required, function (k) {
      return r.hasOwnProperty(k);
    });

    if (shouldPass) {
      var output = bag(r);
      var keys = Obj.keys(output);
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

