import { Assert, UnitTest } from '@ephox/bedrock-client';
import { KAssert } from '@ephox/katamari-assertions';
import fc from 'fast-check';
import { Result, Fun } from '@ephox/katamari';
import { Testable, Eq, Pprint } from '@ephox/dispute';

const { tNumber } = Testable;

const tBoom = <T> () => Testable.testable(Eq.eq(Fun.die('⊥')), Pprint.pprint(Fun.die('⊥')));

UnitTest.test('KAssert.eqError: success', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    KAssert.eqError('eq', i, Result.error(i));
    KAssert.eqError('eq', i, Result.error(i), tBoom());
    KAssert.eqError('eq', i, Result.error(i), tBoom(), tNumber);
  }));
});

UnitTest.test('KAssert.eqError: failure', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    Assert.throws('should throw if numbers differ #1', () => {
      KAssert.eqError('eq', i + 1, Result.error(i));
    });
    Assert.throws('should throw if numbers differ #2', () => {
      KAssert.eqError('eq', i + 1, Result.error(i), tBoom());
    });
    Assert.throws('should throw if numbers differ #2', () => {
      KAssert.eqError('eq', i + 1, Result.error(i), tBoom(), tNumber);
    });
  }));

  fc.assert(fc.property(fc.integer(), fc.string(), (i, s) => {
    Assert.throws('should throw if value #1', () => {
      KAssert.eqError('eq', i + 1, Result.value(s));
    });
    Assert.throws('should throw if value #2', () => {
      KAssert.eqError('eq', i + 1, Result.value(s), tBoom());
    });
    Assert.throws('should throw if value #3', () => {
      KAssert.eqError('eq', i + 1, Result.value(s), tBoom(), tBoom());
    });
  }));
});

UnitTest.test('KAssert.eqValue: success', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    KAssert.eqValue('eq', i, Result.value(i));
    KAssert.eqValue('eq', i, Result.value(i), tNumber);
    KAssert.eqValue('eq', i, Result.value(i), tNumber, tBoom());
  }));
});

UnitTest.test('KAssert.eqValue: failure', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    Assert.throws('should throw if numbers differ #1', () => {
      KAssert.eqValue('eq', i + 1, Result.value(i));
    });
    Assert.throws('should throw if numbers differ #2', () => {
      KAssert.eqValue('eq', i + 1, Result.value(i), tNumber);
    });
    Assert.throws('should throw if numbers differ #2', () => {
      KAssert.eqValue('eq', i + 1, Result.value(i), tNumber, tBoom());
    });
  }));

  fc.assert(fc.property(fc.integer(), fc.string(), (i, s) => {
    Assert.throws('should throw if error #1', () => {
      KAssert.eqValue('eq', i + 1, Result.error(s));
    });
    Assert.throws('should throw if error #2', () => {
      KAssert.eqValue('eq', i + 1, Result.error(s), tBoom());
    });
    Assert.throws('should throw if error #3', () => {
      KAssert.eqValue('eq', i + 1, Result.error(s), tBoom(), tBoom());
    });
  }));
});

UnitTest.test('KAssert.eqResult: success', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    KAssert.eqResult('eq', Result.value(i), Result.value(i));
    KAssert.eqResult('eq', Result.value(i), Result.value(i), tNumber);
    KAssert.eqResult('eq', Result.value(i), Result.value(i), tNumber, tBoom());

    KAssert.eqResult('eq', Result.error(i), Result.error(i));
    KAssert.eqResult('eq', Result.error(i), Result.error(i), tBoom());
    KAssert.eqResult('eq', Result.error(i), Result.error(i), tBoom(), tNumber);
  }));
});

// TODO: KAssert.eqResult: fail
// TODO: KAssert.eqOption, eqSome, eqNone
