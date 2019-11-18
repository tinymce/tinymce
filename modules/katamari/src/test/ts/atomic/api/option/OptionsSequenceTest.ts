import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as Arr from 'ephox/katamari/api/Arr';
import * as Options from 'ephox/katamari/api/Options';
import { Option } from 'ephox/katamari/api/Option';
import fc from 'fast-check';

UnitTest.test('Options.sequence: unit tests', () => {
  Assert.eq('eq', [], Options.sequence<number>([]).getOrDie());
  Assert.eq('eq', [ 3 ], Options.sequence<number>([ Option.some(3) ]).getOrDie());
  Assert.eq('eq', [ 1, 2 ], Options.sequence<number>([ Option.some(1), Option.some(2) ]).getOrDie());

  Assert.eq('eq', true, Options.sequence<number>([ Option.some(1), Option.none() ]).isNone());
  Assert.eq('eq', true, Options.sequence<number>([ Option.none(), Option.some(343) ]).isNone());
});

UnitTest.test('Options.sequence: Single some value', () => {
  fc.assert(fc.property(fc.integer(), (n) => {
    Assert.eq('eq', [ n ], Options.sequence([ Option.some(n) ]).getOrDie());
  }));
});

UnitTest.test('Options.sequence: Two some values', () => {
  fc.assert(fc.property(fc.integer(), fc.integer(), (n, m) => {
    Assert.eq('eq', [ n, m ], Options.sequence<number>([ Option.some(n), Option.some(m) ]).getOrDie());
  }));
});

UnitTest.test('Options.sequence: Array of numbers', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (n) => {
    const someNumbers = Arr.map(n, (x) => Option.some(x));
    Assert.eq('eq', n, Options.sequence<number>(someNumbers).getOrDie());
  }));
});

UnitTest.test('Options.sequence: Some then none', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (n) => {
    const someNumbers = Arr.map(n, (x) => Option.some(x));
    Assert.eq('eq', true, Options.sequence<number>([ ...someNumbers, Option.none<number>() ]).isNone());
  }));
});

UnitTest.test('Options.sequence: None then some', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (n) => {
    const someNumbers = Arr.map(n, (x) => Option.some(x));
    Assert.eq('eq', true, Options.sequence<number>([ Option.none<number>(), ...someNumbers ]).isNone());
  }));
});

UnitTest.test('Options.sequence: all some', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (n) =>
    Assert.eq('eq',
      Options.traverse<number, number>(n, (x) => Option.some(x)).getOrDie(),
      Options.sequence<number>(Arr.map(n, (x) => Option.some(x))).getOrDie())
  ));
});
