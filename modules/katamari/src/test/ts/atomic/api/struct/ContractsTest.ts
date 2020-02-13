import * as Fun from 'ephox/katamari/api/Fun';
import * as Contracts from 'ephox/katamari/api/Contracts';
import { UnitTest, Assert } from '@ephox/bedrock-client';

UnitTest.test('ContractsTest', () => {
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

  (() => {
    const t1 = bagger({
      element: a,
      destroy: b,
      events: c
    });

    Assert.eq('eq', 'element', t1.element());
    Assert.eq('eq', 'destroy', t1.destroy());
    Assert.eq('eq', 'events', t1.events());
  })();

  (() => {
    const t1 = baggerMin({
      element: a,
      destroy: b,
      events: c
    });

    Assert.eq('eq', 'element', t1.element());
    Assert.eq('eq', 'destroy', t1.destroy());
    Assert.eq('eq', 'events', t1.events());
  })();

  (() => {
    const expected = 'All values need to be of type: function. Keys (element, events) were not.';
    try {
      const bg = bagger({
        element: 'element',
        destroy: b,
        events: 'events'
      });

      Assert.fail('Expected failure: ' + expected);
    } catch (err) {
      Assert.eq('eq', expected, err.message);
    }
  })();

  (() => {
    const expected = 'All values need to be of type: function. Keys (element, events) were not.';
    try {
      const bg = baggerMin({
        element: 'element',
        destroy: b,
        events: 'events'
      });

      Assert.fail('Expected failure: ' + expected);
    } catch (err) {
      Assert.eq('eq', expected, err.message);
    }
  })();

  (() => {
    const expected = 'Unsupported keys for object: blah';
    try {
      const bg = bagger({
        element: a,
        destroy: b,
        events: c,
        blah: 'balh'
      });

      Assert.fail('Expected failure: ' + expected);
    } catch (err) {
      Assert.eq('eq', expected, err.message);
    }
  })();

  (() => {
    // Ensure supports extra keys, with any type.
    const bg = baggerMin({
      element: a,
      destroy: b,
      events: c,
      blah: 'balh'
    });

    Assert.eq('eq', 'element', bg.element());
    Assert.eq('eq', 'destroy', bg.destroy());
    Assert.eq('eq', 'events', bg.events());
  })();

  (() => {
    const expected = 'All values need to be of type: 10 if mustBe10. Keys (mustBe10) were not.';
    try {
      const bg = baggerMin10({
        mustBe10: 'dog',
        any: 'cat'
      });

      Assert.fail('Expected failure: ' + expected);
    } catch (err) {
      Assert.eq('eq', expected, err.message);
    }
  })();

  (() => {
    // EnsureWith provides a custom value validator.
    const bg = baggerMin10({
      mustBe10: 10,
      any: 'cat'
    });

    Assert.eq('eq', 10, bg.mustBe10);
    Assert.eq('eq', 'cat', bg.any);
  })();
});
