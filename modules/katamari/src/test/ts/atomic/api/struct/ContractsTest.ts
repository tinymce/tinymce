import * as Fun from 'ephox/katamari/api/Fun';
import * as Contracts from 'ephox/katamari/api/Contracts';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ContractsTest', function () {
  const a = Fun.constant('element');
  const b = Fun.constant('destroy');
  const c = Fun.constant('events');

  const bagger = Contracts.exactly([ 'element', 'destroy', 'events' ]);
  const baggerMin = Contracts.ensure([ 'element', 'destroy', 'events' ]);

  const baggerMin10 = Contracts.ensureWith([ 'mustBe10', 'any' ], {
    label: '10 if mustBe10',
    validate (v, k) {
      return k === 'mustBe10' ? v === 10 : true;
    }
  });

  (function () {
    const t1 = bagger({
      element: a,
      destroy: b,
      events: c
    });

    assert.eq('element', t1.element());
    assert.eq('destroy', t1.destroy());
    assert.eq('events', t1.events());
  })();

  (function () {
    const t1 = baggerMin({
      element: a,
      destroy: b,
      events: c
    });

    assert.eq('element', t1.element());
    assert.eq('destroy', t1.destroy());
    assert.eq('events', t1.events());
  })();

  (function () {
    const expected = 'All values need to be of type: function. Keys (element, events) were not.';
    try {
      const bg = bagger({
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
    const expected = 'All values need to be of type: function. Keys (element, events) were not.';
    try {
      const bg = baggerMin({
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
    const expected = 'Unsupported keys for object: blah';
    try {
      const bg = bagger({
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
    const bg = baggerMin({
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
    const expected = 'All values need to be of type: 10 if mustBe10. Keys (mustBe10) were not.';
    try {
      const bg = baggerMin10({
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
    const bg = baggerMin10({
      mustBe10: 10,
      any: 'cat'
    });

    assert.eq(10, bg.mustBe10);
    assert.eq('cat', bg.any);
  })();
});
