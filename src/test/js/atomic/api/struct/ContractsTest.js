import Fun from 'ephox/katamari/api/Fun';
import Contracts from 'ephox/katamari/api/Contracts';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('ContractsTest', function() {
  var a = Fun.constant('element');
  var b = Fun.constant('destroy');
  var c = Fun.constant('events');

  var bagger = Contracts.exactly([ 'element', 'destroy', 'events' ]);
  var baggerMin = Contracts.ensure([ 'element', 'destroy', 'events' ]);

  var baggerMin10 = Contracts.ensureWith([ 'mustBe10', 'any' ], {
    label: '10 if mustBe10',
    validate: function (v, k) {
      return k === 'mustBe10' ? v === 10 : true;
    }
  });

  (function () {
    var t1 = bagger({
      element: a,
      destroy: b,
      events: c
    });

    assert.eq('element', t1.element());
    assert.eq('destroy', t1.destroy());
    assert.eq('events', t1.events());
  })();

  (function () {
    var t1 = baggerMin({
      element: a,
      destroy: b,
      events: c
    });

    assert.eq('element', t1.element());
    assert.eq('destroy', t1.destroy());
    assert.eq('events', t1.events());
  })();


  (function () {
    var expected = 'All values need to be of type: function. Keys (element, events) were not.';
    try {
      var bg = bagger({
        element: 'element',
        destroy: b,
        events: 'events'
      });

      assert.fail('Expected failure: ' + expected);
    } catch (err) {
      assert.eq(expected, err.message);
    }
  })();

  (function () {
    var expected = 'All values need to be of type: function. Keys (element, events) were not.';
    try {
      var bg = baggerMin({
        element: 'element',
        destroy: b,
        events: 'events'
      });

      assert.fail('Expected failure: ' + expected);
    } catch (err) {
      assert.eq(expected, err.message);
    }
  })();

  (function () {
    var expected = 'Unsupported keys for object: blah';
    try {
      var bg = bagger({
        element: a,
        destroy: b,
        events: c,
        blah: 'balh'
      });

      assert.fail('Expected failure: ' + expected);
    } catch (err) {
      assert.eq(expected, err.message);
    }
  })();

  (function () {
    // Ensure supports extra keys, with any type.
    var bg = baggerMin({
      element: a,
      destroy: b,
      events: c,
      blah: 'balh'
    });

    assert.eq('element', bg.element());
    assert.eq('destroy', bg.destroy());
    assert.eq('events', bg.events());
  })();

  (function () {
    var expected = 'All values need to be of type: 10 if mustBe10. Keys (mustBe10) were not.';
    try {
      var bg = baggerMin10({
        mustBe10: 'dog',
        any: 'cat'
      });
      
      assert.fail('Expected failure: ' + expected);
    } catch (err) {
      assert.eq(expected, err.message);
    }
  })();

  (function () {
    // EnsureWith provides a custom value validator.
    var bg = baggerMin10({
      mustBe10: 10,
      any: 'cat'
    });

    assert.eq(10, bg.mustBe10);
    assert.eq('cat', bg.any);
  })();
});

