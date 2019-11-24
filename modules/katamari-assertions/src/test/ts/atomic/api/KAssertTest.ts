import { Assert, UnitTest } from '@ephox/bedrock-client';
import { KAssert } from '@ephox/katamari-assertions';
import fc from 'fast-check';
import { Result, Fun } from '@ephox/katamari';
import { Testable, Eq, Pprint } from '@ephox/dispute';

const { tNumber } = Testable;

const tBoom = <T> () => Testable.testable(Eq.eq(Fun.die('⊥')), Pprint.pprint(Fun.die('⊥')));

const twoDifferentNumbers = fc.tuple(fc.integer(), fc.integer()).filter(([a, b]) => a !== b);

UnitTest.test('KAssert.eqError: success', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    KAssert.eqError('eq', i, Result.error(i));
    KAssert.eqError('eq', i, Result.error(i), tBoom());
    KAssert.eqError('eq', i, Result.error(i), tBoom(), tNumber);
  }));
});

UnitTest.test('KAssert.eqError: failure', () => {
  fc.assert(fc.property(twoDifferentNumbers, ([a, b]) => {
    Assert.throws('should throw if numbers differ #1', () => {
      KAssert.eqError('eq', a, Result.error(b));
    });
    Assert.throws('should throw if numbers differ #2', () => {
      KAssert.eqError('eq', a, Result.error(b), tBoom());
    });
    Assert.throws('should throw if numbers differ #2', () => {
      KAssert.eqError('eq', a, Result.error(b), tBoom(), tNumber);
    });
  }));

  fc.assert(fc.property(fc.integer(), fc.string(), (i, s) => {
    Assert.throws('should throw if value #1', () => {
      KAssert.eqError('eq', i, Result.value(s));
    });
    Assert.throws('should throw if value #2', () => {
      KAssert.eqError('eq', i, Result.value(s), tBoom());
    });
    Assert.throws('should throw if value #3', () => {
      KAssert.eqError('eq', i, Result.value(s), tBoom(), tBoom());
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
  fc.assert(fc.property(twoDifferentNumbers, ([a, b]) => {
    Assert.throws('should throw if numbers differ #1', () => {
      KAssert.eqValue('eq', a, Result.value(b));
    });
    Assert.throws('should throw if numbers differ #2', () => {
      KAssert.eqValue('eq', a, Result.value(b), tNumber);
    });
    Assert.throws('should throw if numbers differ #2', () => {
      KAssert.eqValue('eq', a, Result.value(b), tNumber, tBoom());
    });
  }));

  fc.assert(fc.property(fc.integer(), fc.string(), (i, s) => {
    Assert.throws('should throw if error #1', () => {
      KAssert.eqValue('eq', i, Result.error(s));
    });
    Assert.throws('should throw if error #2', () => {
      KAssert.eqValue('eq', i, Result.error(s), tBoom());
    });
    Assert.throws('should throw if error #3', () => {
      KAssert.eqValue('eq', i, Result.error(s), tBoom(), tBoom());
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

UnitTest.test('KAssert.eqResult: fail', () => {
  fc.assert(fc.property(twoDifferentNumbers, ([a, b]) => {
    Assert.throws('value(a) != (value(!a)) #1', () => {
      KAssert.eqResult('eq', Result.value(a), Result.value(b));
    });
    Assert.throws('value(a) != (value(!a)) #2', () => {
      KAssert.eqResult('eq', Result.value(a), Result.value(b), tNumber);
    });
    Assert.throws('value(a) != (value(!a)) #2', () => {
      KAssert.eqResult('eq', Result.value(a), Result.value(b), tNumber, tBoom());
    });
  }));

  fc.assert(fc.property(twoDifferentNumbers, ([a, b]) => {
    Assert.throws('error(a) != (error(!a)) #1', () => {
      KAssert.eqResult('eq', Result.error(a), Result.error(b));
    });
    Assert.throws('error(a) != (error(!a)) #2', () => {
      KAssert.eqResult('eq', Result.error(a), Result.error(b), tBoom());
    });
    Assert.throws('result(a) != (result(!a)) #2', () => {
      KAssert.eqResult('eq', Result.error(a), Result.error(b), tBoom(), tNumber);
    });
  }));

  fc.assert(fc.property(fc.integer(), fc.string(), (i, s) => {
    Assert.throws('value != error #1', () => {
      KAssert.eqResult('eq', Result.value(i), Result.error(s));
    });
    Assert.throws('value != error #2', () => {
      KAssert.eqResult('eq', Result.value(i), Result.error(s), tBoom());
    });
    Assert.throws('value != error #3', () => {
      KAssert.eqResult('eq', Result.value(i), Result.error(s), tBoom());
    });

    Assert.throws('error != value #1', () => {
      KAssert.eqResult('eq', Result.error(i), Result.value(s));
    });
    Assert.throws('error != value #2', () => {
      KAssert.eqResult('eq', Result.error(i), Result.value(s), tBoom());
    });
    Assert.throws('error != value #3', () => {
      KAssert.eqResult('eq', Result.error(i), Result.value(s), tBoom(), tBoom());
    });
  }));
});

// TODO: KAssert.eqOption, eqSome, eqNone
