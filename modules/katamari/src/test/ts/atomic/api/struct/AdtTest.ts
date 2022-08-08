import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import { Adt } from 'ephox/katamari/api/Adt';
import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';

const checkInvalid = (message: string, f: () => void) => {
  let error = false;
  try {
    f();
  } catch (e) {
    if (e === 'ADTWHOOPS') {
      // eslint-disable-next-line no-console
      console.log('die function incorrectly called');
    } else {
      error = true;
    }
  }

  if (!error) {
    throw new Error('Unexpected pass: ' + message);
  }
};

const checkInvalidGenerate = (cases: any, message: string) => {
  checkInvalid('generate() did not throw an error. Input: "' + message + '"', () => {
    Adt.generate(cases);
  });
};

describe('atomic.katamari.api.struct.AdtTest', () => {
  it('checkInvalidGenerate', () => {
    checkInvalidGenerate({}, 'object instead of array');
    checkInvalidGenerate([], 'empty cases array');
    checkInvalidGenerate([ 'f' ], 'array contains strings');
    checkInvalidGenerate([{}], 'empty case');
    checkInvalidGenerate([{ t: {}}], 'object case arguments');
    checkInvalidGenerate([{ cata: [] }], 'case named cata');
    checkInvalidGenerate([{ a: [] }, { a: [] }], 'duplicate names');
    checkInvalidGenerate([
      {
        one: [],
        two: []
      }
    ], 'two cases in one');
  });

  it('works with real Adt from the soldier project', () => {
    // A real Adt from the soldier project
    const soldierBlock = Adt.generate([
      { none: [] },
      { root: [ 'target', 'block' ] },
      { created: [ 'target', 'block' ] },
      { actual: [ 'target', 'block' ] }
    ]);

    const none = (...args: any[]) => {
      assert.deepEqual(args.length, 0);
    };

    const targetStr = 'target';
    const blockStr = 'block';

    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    const tag = function (target: string, block: string) {
      assert.equal(arguments.length, 2);
      assert.equal(target, targetStr);
      assert.equal(block, blockStr);
    };

    let die = () => {
      // this is used when an error is expected, so we need to use fancy tricks
      // to actually fail
      throw new Error('ADTWHOOPS');
    };

    // double functions because that makes actual use better
    const adtNone = soldierBlock.none();
    const adtRoot = soldierBlock.root(targetStr, blockStr);
    const adtCreated = soldierBlock.created(targetStr, blockStr);
    const adtActual = soldierBlock.actual(targetStr, blockStr);

    checkInvalid('tag passed to none', () => {
      adtNone.fold(tag, die, die, die);
    });

    checkInvalid('none passed to root', () => {
      adtRoot.fold(die, none, die, die);
    });

    checkInvalid('none passed to created', () => {
      adtCreated.fold(die, die, none, die);
    });

    checkInvalid('none passed to actual', () => {
      adtActual.fold(die, die, die, none);
    });

    // valid checks, so we can redefine die to be sensible now
    die = Fun.die('Well that was unexpected');

    adtNone.fold(none, die, die, die);
    adtRoot.fold(die, tag, die, die);
    adtCreated.fold(die, die, tag, die);
    adtActual.fold(die, die, die, tag);

    const cheese = Fun.constant('cheese');

    assert.equal(adtNone.fold(cheese, die, die, die), 'cheese');
    assert.equal(adtRoot.fold(die, cheese, die, die), 'cheese');
    assert.equal(adtCreated.fold(die, die, cheese, die), 'cheese');
    assert.equal(adtActual.fold(die, die, die, cheese), 'cheese');
  });

  const newAdt = Adt.generate([
    { nothing: [] },
    { unknown: [ 'guesses' ] },
    { exact: [ 'value', 'precision' ] }
  ]);

  const arbNothing = fc.constant(newAdt.nothing());

  const arbUnknown = fc.array(fc.string()).map((guesses) => newAdt.unknown(guesses));

  const arbExact = fc.tuple(fc.integer(), fc.integer()).map((arr) => newAdt.exact(arr[0], arr[1]));

  const arbAdt = fc.oneof(
    arbNothing,
    arbUnknown,
    arbExact
  );

  const allKeys = [ 'nothing', 'unknown', 'exact' ];
  const arbKeys = fc.constantFrom(...allKeys);

  it('Error is thrown if not all arguments are supplied', () => {
    fc.assert(fc.property(arbAdt, fc.array(arbKeys, 1, 40), (subject, exclusions) => {
      const original = Arr.filter(allKeys, (k) => !Arr.contains(exclusions, k));

      try {
        const branches = Arr.mapToObject(original, () => Fun.identity);
        subject.match(branches);
        return false;
      } catch (err: any) {
        return err.message.indexOf('nothing') > -1;
      }
    }));
  });

  const record = (...args: any[]) => {
    return args;
  };

  it('adt.nothing.match should pass [ ]', () => {
    fc.assert(fc.property(arbNothing, (subject) => {
      const contents = subject.match({
        nothing: record,
        unknown: Fun.die('should not be unknown'),
        exact: Fun.die('should not be exact')
      });
      assert.deepEqual(contents, []);
    }));
  });

  it('adt.nothing.match should be same as fold', () => {
    fc.assert(fc.property(arbNothing, (subject) => {
      const matched = subject.match({
        nothing: record,
        unknown: Fun.die('should not be unknown'),
        exact: Fun.die('should not be exact')
      });

      const folded = subject.fold(record, Fun.die('should not be unknown'), Fun.die('should not be exact'));
      assert.deepEqual(folded, matched);
    }));
  });

  it('adt.unknown.match should pass 1 parameter: [ guesses ]', () => {
    fc.assert(fc.property(arbUnknown, (subject) => {
      const contents = subject.match({
        nothing: Fun.die('should not be nothing'),
        unknown: record,
        exact: Fun.die('should not be exact')
      });
      assert.deepEqual(contents.length, 1);
    }));
  });

  it('adt.unknown.match should be same as fold', () => {
    fc.assert(fc.property(arbUnknown, (subject) => {
      const matched = subject.match({
        nothing: Fun.die('should not be nothing'),
        unknown: record,
        exact: Fun.die('should not be exact')
      });

      const folded = subject.fold(Fun.die('should not be nothing'), record, Fun.die('should not be exact'));
      assert.deepEqual(folded, matched);
    }));
  });

  it('adt.exact.match should pass 2 parameters [ value, precision ]', () => {
    fc.assert(fc.property(arbExact, (subject) => {
      const contents = subject.match({
        nothing: Fun.die('should not be nothing'),
        unknown: Fun.die('should not be unknown'),
        exact: record
      });
      assert.deepEqual(contents.length, 2);
    }));
  });

  it('adt.exact.match should be same as fold', () => {
    fc.assert(fc.property(arbExact, (subject) => {
      const matched = subject.match({
        nothing: Fun.die('should not be nothing'),
        unknown: Fun.die('should not be unknown'),
        exact: record
      });

      const folded = subject.fold(Fun.die('should not be nothing'), Fun.die('should not be unknown'), record);
      assert.deepEqual(folded, matched);
    }));
  });

  it('adt.match must have the right arguments, not just the right number', () => {
    fc.assert(fc.property(arbAdt, (subject) => {
      try {
        subject.match({
          not: Fun.identity,
          the: Fun.identity,
          right: Fun.identity
        });
        return false;
      } catch (err: any) {
        return err.message.indexOf('nothing') > -1;
      }
    }));
  });
});
