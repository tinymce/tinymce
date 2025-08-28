import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as Contracts from 'ephox/katamari/api/Contracts';
import * as Fun from 'ephox/katamari/api/Fun';

describe('atomic.katamari.api.struct.ContractsTest', () => {

  const a = Fun.constant('element');
  const b = Fun.constant('destroy');
  const c = Fun.constant('events');

  const bagger = Contracts.exactly([ 'element', 'destroy', 'events' ]);
  const baggerMin = Contracts.ensure([ 'element', 'destroy', 'events' ]);

  const baggerMin10 = Contracts.ensureWith([ 'mustBe10', 'any' ], {
    label: '10 if mustBe10',
    validate: (v, k) => {
      return k === 'mustBe10' ? v === 10 : true;
    }
  });

  it('bagger', () => {
    const t1 = bagger({
      element: a,
      destroy: b,
      events: c
    });

    assert.equal(t1.element(), 'element');
    assert.equal(t1.destroy(), 'destroy');
    assert.equal(t1.events(), 'events');
  });

  it('baggermin', () => {
    const t1 = baggerMin({
      element: a,
      destroy: b,
      events: c
    });

    assert.equal(t1.element(), 'element');
    assert.equal(t1.destroy(), 'destroy');
    assert.equal(t1.events(), 'events');
  });

  it('fails 1', () => {
    const expected = 'All values need to be of type: function. Keys (element, events) were not.';
    try {
      bagger({
        element: 'element',
        destroy: b,
        events: 'events'
      });

      assert.fail('Expected failure: ' + expected);
    } catch (err: any) {
      assert.equal(err.message, expected);
    }
  });

  it('fails 2', () => {
    const expected = 'All values need to be of type: function. Keys (element, events) were not.';
    try {
      baggerMin({
        element: 'element',
        destroy: b,
        events: 'events'
      });

      assert.fail('Expected failure: ' + expected);
    } catch (err: any) {
      assert.equal(err.message, expected);
    }
  });

  it('fails with invalid key', () => {
    const expected = 'Unsupported keys for object: blah';
    try {
      bagger({
        element: a,
        destroy: b,
        events: c,
        blah: 'balh'
      });

      assert.fail('Expected failure: ' + expected);
    } catch (err: any) {
      assert.equal(err.message, expected);
    }
  });

  it('supports extra keys, with any type', () => {
    const bg = baggerMin({
      element: a,
      destroy: b,
      events: c,
      blah: 'balh'
    });

    assert.equal(bg.element(), 'element');
    assert.equal(bg.destroy(), 'destroy');
    assert.equal(bg.events(), 'events');
  });

  it('fails if values are wrong type', () => {
    const expected = 'All values need to be of type: 10 if mustBe10. Keys (mustBe10) were not.';
    try {
      baggerMin10({
        mustBe10: 'dog',
        any: 'cat'
      });

      assert.fail('Expected failure: ' + expected);
    } catch (err: any) {
      assert.equal(err.message, expected);
    }
  });

  it('EnsureWith provides a custom value validator', () => {
    const bg = baggerMin10({
      mustBe10: 10,
      any: 'cat'
    });

    assert.equal(bg.mustBe10, 10);
    assert.equal(bg.any, 'cat');
  });
});
