import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Fun from 'ephox/katamari/api/Fun';
import { Maybe } from 'ephox/katamari/api/Maybe';
import * as Maybes from 'ephox/katamari/api/Maybes';

describe('atomic.katamari.maybe.MonadTest', () => {
  context('flatten', () => {
    it('flattens correctly', () => {
      const nothing1 = Maybes.flatten(Maybes.nothing());
      assert.isTrue(Maybes.isNothing(nothing1));

      const nothing2 = Maybes.flatten(Maybes.just(Maybes.nothing()));
      assert.isTrue(Maybes.isNothing(nothing2));

      const just = Maybes.flatten(Maybes.just(Maybes.just('1')));
      if (Maybes.isJust(just)) {
        assert.equal(just.value, '1');
      } else {
        assert.fail('Should not be nothing');
      }
    });

    it('mirrors bind', () => {
      const arbInner = fc.tuple(fc.boolean(), fc.string()).map(([ isJust, value ]) => {
        if (isJust) {
          return Maybes.just(value);
        } else {
          return Maybes.nothing<string>();
        }
      });
      const arbNested = fc.tuple(fc.boolean(), arbInner).map(([ isJust, value ]) => {
        if (isJust) {
          return Maybes.just(value);
        } else {
          return Maybes.nothing<Maybe<string>>();
        }
      });
      fc.assert(fc.property(arbNested, (maybe) => {
        const flattened = Maybes.flatten(maybe);
        const bound = Maybes.bind<Maybe<string>, string>(Fun.identity)(maybe);
        assert.deepEqual(flattened, bound);
      }));
    });
  });

  context('bind', () => {
    it('does not call the bind function when binding on Nothing', () => {
      const nothing = Fun.pipe(
        Maybes.nothing(),
        Maybes.bind(Fun.die('Should not call binder as there is nothing to bind'))
      );

      assert.isTrue(Maybes.isNothing(nothing), 'Expected nothing');
    });

    it('passes the right values through the bind function when binding on Just', () => {
      const just = Fun.pipe(
        Maybes.just('test'),
        Maybes.bind((test) => {
          assert.equal(test, 'test');
          return Maybes.just('other-test');
        })
      );

      if (Maybes.isJust(just)) {
        assert.equal(just.value, 'other-test');
      } else {
        assert.fail('Should not be nothing');
      }

      const nothing = Fun.pipe(
        Maybes.just('test'),
        Maybes.bind((test) => {
          assert.equal(test, 'test');
          return Maybes.nothing();
        })
      );
      assert.isTrue(Maybes.isNothing(nothing), 'Expected nothing');
    });
  });

  context('bindNullable', () => {
    it('does not call the bind function when binding on Nothing', () => {
      const nothing = Fun.pipe(
        Maybes.nothing(),
        Maybes.bindNullable(Fun.die('Should not call binder as there is nothing to bind'))
      );

      assert.isTrue(Maybes.isNothing(nothing), 'Expected nothing');
    });

    it('passes the right values through the bind function when binding on Just', () => {
      const nothing1 = Fun.pipe(
        Maybes.just('test'),
        Maybes.bindNullable((test) => {
          assert.equal(test, 'test');
          return null;
        })
      );
      assert.isTrue(Maybes.isNothing(nothing1));

      const nothing2 = Fun.pipe(
        Maybes.just('test'),
        Maybes.bindNullable((test) => {
          assert.equal(test, 'test');
          return undefined;
        })
      );
      assert.isTrue(Maybes.isNothing(nothing2));

      const just = Fun.pipe(
        Maybes.just('test'),
        Maybes.bindNullable((test) => {
          assert.equal(test, 'test');
          return 'test2';
        })
      );

      if (Maybes.isJust(just)) {
        assert.equal(just.value, 'test2');
      } else {
        assert.fail('Should not be nothing');
      }
    });
  });
});