import { describe, it } from '@ephox/bedrock-client';
import { Pprint, Testable } from '@ephox/dispute';
import { assert } from 'chai';

import { Optional } from 'ephox/katamari/api/Optional';
import { tOptional } from 'ephox/katamari/api/OptionalInstances';
import { assertOptional } from 'ephox/katamari/test/AssertOptional';

const { tString } = Testable;

describe('atomic.katamari.api.optional.OptionalInstancesTest', () => {
  it('OptionalInstances.testable<number>', () => {
    assertOptional(Optional.some(3), Optional.some(3));
    assertOptional(Optional.some(3), Optional.some(3));

    assert.throws(() => {
      assertOptional(Optional.some(2), Optional.some(3));
    });

    assert.throws(() => {
      assertOptional(Optional.none(), Optional.some(3));
    });

    assert.throws(() => {
      assertOptional(Optional.some(3), Optional.none());
    });

    assert.throws(() => {
      assertOptional(Optional.some(2), Optional.some(3));
    });

    assert.throws(() => {
      assertOptional(Optional.none(), Optional.some(3));
    });

    assert.throws(() => {
      assertOptional(Optional.some(3), Optional.none());
    });
  });

  it('OptionalInstances.testable<string>', () => {
    assertOptional(Optional.some('a'), Optional.some('a'));
    assertOptional(Optional.some('a'), Optional.some('a'));

    assert.throws(() => {
      assertOptional(Optional.none(), Optional.some('a'));
    });

    assert.throws(() => {
      assertOptional(Optional.some('a'), Optional.none());
    });

    assert.throws(() => {
      assertOptional(Optional.some('b'), Optional.some('a'));
    });

    assert.throws(() => {
      assertOptional(Optional.none(), Optional.some('a'));
    });

    assert.throws(() => {
      assertOptional(Optional.some('a'), Optional.none());
    });

    assert.throws(() => {
      assertOptional(Optional.some('b'), Optional.some('a'));
    });
  });

  it('OptionalInstances pprint', () => {
    assert.equal(Pprint.render(Optional.none(), tOptional(tString)), 'Optional.none()');
    assert.equal(Pprint.render(Optional.some('cat'), tOptional(tString)), 'Optional.some(\n  "cat"\n)');

    assert.equal(Pprint.render(Optional.none(), tOptional()), 'Optional.none()');
    assert.equal(Pprint.render(Optional.some('cat'), tOptional()), 'Optional.some(\n  "cat"\n)');
  });
});
