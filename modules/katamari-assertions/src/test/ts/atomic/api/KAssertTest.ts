import { Assert, UnitTest } from '@ephox/bedrock-client';
import { KAssert } from '@ephox/katamari-assertions';
import fc from 'fast-check';
import { Result, Fun, Option } from '@ephox/katamari';
import { Testable, Eq, Pprint } from '@ephox/dispute';

const { tNumber } = Testable;

const tBoom = <T>() => Testable.testable(Eq.eq(Fun.die('⊥')), Pprint.pprint(Fun.die('⊥')));

const twoDifferentNumbers = fc.tuple(fc.integer(), fc.integer()).filter(([ a, b ]) => a !== b);

UnitTest.test('KAssert.eqError: success (reflexivity)', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    KAssert.eqError('eq', i, Result.error(i));
    KAssert.eqError('eq', i, Result.error(i), tBoom());
    KAssert.eqError('eq', i, Result.error(i), tBoom(), tNumber);
  }));
});

UnitTest.test('KAssert.eqError: failure', () => {
  fc.assert(fc.property(twoDifferentNumbers, ([ a, b ]) => {
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
  fc.assert(fc.property(twoDifferentNumbers, ([ a, b ]) => {
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
  fc.assert(fc.property(twoDifferentNumbers, ([ a, b ]) => {
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

  fc.assert(fc.property(twoDifferentNumbers, ([ a, b ]) => {
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

UnitTest.test('KAssert.eqSome: success (reflexivity)', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    KAssert.eqSome('eq', i, Option.some(i));
    KAssert.eqSome('eq', i, Option.some(i), tNumber);
  }));
});

UnitTest.test('KAssert.eqSome: failure', () => {
  fc.assert(fc.property(twoDifferentNumbers, ([ a, b ]) => {
    Assert.throws('some(i) != some(!i) #1', () => {
      KAssert.eqSome('eq', a, Option.some(b));
    });
  }));
  fc.assert(fc.property(twoDifferentNumbers, ([ a, b ]) => {
    Assert.throws('some(i) != some(!i) #2', () => {
      KAssert.eqSome('eq', a, Option.some(b), tNumber);
    });
  }));
});

UnitTest.test('KAssert.eqNone: success (reflexivity)', () => {
  KAssert.eqNone('eq', Option.none());
});

UnitTest.test('KAssert.eqNone: failure', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    Assert.throws('some(i) != none', () => {
      KAssert.eqNone('eq', Option.some(i));
    });
  }));
});

UnitTest.test('KAssert.eqOption: success (reflexivity)', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    KAssert.eqOption('eq', Option.some(i), Option.some(i));
    KAssert.eqOption('eq', Option.some(i), Option.some(i), tNumber);
  }));
  KAssert.eqOption('eq', Option.none(), Option.none());
});

UnitTest.test('KAssert.eqOption: failure', () => {
  fc.assert(fc.property(twoDifferentNumbers, ([ a, b ]) => {
    Assert.throws('some(i) != some(!i) #1', () => {
      KAssert.eqOption('eq', Option.some(a), Option.some(b));
    });
  }));
  fc.assert(fc.property(twoDifferentNumbers, ([ a, b ]) => {
    Assert.throws('some(i) != some(!i) #2', () => {
      KAssert.eqOption('eq', Option.some(a), Option.some(b), tNumber);
    });
  }));
  fc.assert(fc.property(fc.integer(), (i) => {
    Assert.throws('none != some(i) #1', () => {
      KAssert.eqOption('eq', Option.none(), Option.some(i));
    });
    Assert.throws('none != some(i) #2', () => {
      KAssert.eqOption('eq', Option.none(), Option.some(i), tBoom());
    });
  }));
  fc.assert(fc.property(fc.integer(), (i) => {
    Assert.throws('some(i) != none #1', () => {
      KAssert.eqOption('eq', Option.some(i), Option.none());
    });
    Assert.throws('some(i) != none #2', () => {
      KAssert.eqOption('eq', Option.some(i), Option.none(), tBoom());
    });
  }));
});
