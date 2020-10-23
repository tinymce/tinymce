import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import * as Arr from 'ephox/katamari/api/Arr';
import { Optional } from 'ephox/katamari/api/Optional';
import { tOptional } from 'ephox/katamari/api/OptionalInstances';
import * as Optionals from 'ephox/katamari/api/Optionals';

UnitTest.test('Optionals.sequence: unit tests', () => {
  Assert.eq('eq', Optional.some([]), Optionals.sequence<number>([]), tOptional());
  Assert.eq('eq', Optional.some([ 3 ]), Optionals.sequence<number>([ Optional.some(3) ]), tOptional());
  Assert.eq('eq', Optional.some([ 1, 2 ]), Optionals.sequence<number>([ Optional.some(1), Optional.some(2) ]), tOptional());

  Assert.eq('eq', Optional.none(), Optionals.sequence<number>([ Optional.some(1), Optional.none() ]), tOptional());
  Assert.eq('eq', Optional.none(), Optionals.sequence<number>([ Optional.none(), Optional.some(343) ]), tOptional());
});

UnitTest.test('Optionals.sequence: Single some value', () => {
  fc.assert(fc.property(fc.integer(), (n) => {
    Assert.eq('eq', Optional.some([ n ]), Optionals.sequence([ Optional.some(n) ]), tOptional());
  }));
});

UnitTest.test('Optionals.sequence: Two some values', () => {
  fc.assert(fc.property(fc.integer(), fc.integer(), (n, m) => {
    Assert.eq('eq', Optional.some([ n, m ]), Optionals.sequence<number>([ Optional.some(n), Optional.some(m) ]), tOptional());
  }));
});

UnitTest.test('Optionals.sequence: Array of numbers', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (n) => {
    const someNumbers = Arr.map(n, (x) => Optional.some(x));
    Assert.eq('eq', Optional.some(n), Optionals.sequence<number>(someNumbers), tOptional());
  }));
});

UnitTest.test('Optionals.sequence: Some then none', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (n) => {
    const someNumbers = Arr.map(n, (x) => Optional.some(x));
    Assert.eq('eq', Optional.none(), Optionals.sequence<number>([ ...someNumbers, Optional.none<number>() ]), tOptional());
  }));
});

UnitTest.test('Optionals.sequence: None then some', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (n) => {
    const someNumbers = Arr.map(n, (x) => Optional.some(x));
    Assert.eq('eq', Optional.none(), Optionals.sequence<number>([ Optional.none<number>(), ...someNumbers ]), tOptional());
  }));
});

UnitTest.test('Optionals.sequence: all some', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (n) =>
    Assert.eq('eq',
      Optionals.traverse<number, number>(n, (x) => Optional.some(x)),
      Optionals.sequence<number>(Arr.map(n, (x) => Optional.some(x))),
      tOptional()
    )
  ));
});
