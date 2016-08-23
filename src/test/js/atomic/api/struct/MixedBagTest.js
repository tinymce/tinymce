test(
  'MixedBagTest',

  [
    'ephox.katamari.data.MixedBag'
  ],

  function (MixedBag) {
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

        assert.fail('Expected failure: ' + blah);
      } catch (err) {
        assert.eq(expected, err);
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
        assert.eq(expected, err);
      }
    })();

    (function () {
      var expected = 'You must specify at least one required or optional field.';
      try {
        var bg = MixedBag([  ], [  ]);

        assert.fail('Expected failure: ' + expected);
      } catch (err) {
        assert.eq(expected, err);
      }
    })();

    (function () {
      var expected = 'The value 10 in the required fields was not a string.';
      try {
        var bg = MixedBag([ 10 ], [  ]);

        assert.fail('Expected failure: ' + expected);
      } catch (err) {
        assert.eq(expected, err);
      }
    })();

    (function () {
      var expected = 'The value 5 in the optional fields was not a string.';
      try {
        var bg = MixedBag([ ], [ 5 ]);

        assert.fail('Expected failure: ' + expected);
      } catch (err) {
        assert.eq(expected, err);
      }
    })();

    (function () {
      var expected = 'The required fields must be an array. Was: apple.';
      try {
        var bg = MixedBag('apple', [ 5 ]);

        assert.fail('Expected failure: ' + expected);
      } catch (err) {
        assert.eq(expected, err);
      }
    })();

    (function () {
      var expected = 'The optional fields must be an array. Was: beetroot.';
      try {
        var bg = MixedBag([], 'beetroot');

        assert.fail('Expected failure: ' + expected);
      } catch (err) {
        assert.eq(expected, err);
      }
    })();

    (function () {
      var expected = 'The field: cat occurs more than once in the combined fields: [apple, cat, cat].';
      try {
        var bg = MixedBag([ 'cat' ], [ 'apple', 'cat' ]);

        assert.fail('Expected failure: ' + expected);
      } catch (err) {
        assert.eq(expected, err);
      }
    })();
  }
);