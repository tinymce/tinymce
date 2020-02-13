import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as Arr from 'ephox/katamari/api/Arr';
import * as Options from 'ephox/katamari/api/Options';
import { Option } from 'ephox/katamari/api/Option';
import fc from 'fast-check';
import { tOption } from 'ephox/katamari/api/OptionInstances';

UnitTest.test('Options.sequence: unit tests', () => {
  Assert.eq('eq', Option.some([]), Options.sequence<number>([]), tOption());
  Assert.eq('eq', Option.some([ 3 ]), Options.sequence<number>([ Option.some(3) ]), tOption());
  Assert.eq('eq', Option.some([ 1, 2 ]), Options.sequence<number>([ Option.some(1), Option.some(2) ]), tOption());

  Assert.eq('eq', Option.none(), Options.sequence<number>([ Option.some(1), Option.none() ]), tOption());
  Assert.eq('eq', Option.none(), Options.sequence<number>([ Option.none(), Option.some(343) ]), tOption());
});

UnitTest.test('Options.sequence: Single some value', () => {
  fc.assert(fc.property(fc.integer(), (n) => {
    Assert.eq('eq', Option.some([ n ]), Options.sequence([ Option.some(n) ]), tOption());
  }));
});

UnitTest.test('Options.sequence: Two some values', () => {
  fc.assert(fc.property(fc.integer(), fc.integer(), (n, m) => {
    Assert.eq('eq', Option.some([ n, m ]), Options.sequence<number>([ Option.some(n), Option.some(m) ]), tOption());
  }));
});

UnitTest.test('Options.sequence: Array of numbers', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (n) => {
    const someNumbers = Arr.map(n, (x) => Option.some(x));
    Assert.eq('eq', Option.some(n), Options.sequence<number>(someNumbers), tOption());
  }));
});

UnitTest.test('Options.sequence: Some then none', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (n) => {
    const someNumbers = Arr.map(n, (x) => Option.some(x));
    Assert.eq('eq', Option.none(), Options.sequence<number>([ ...someNumbers, Option.none<number>() ]), tOption());
  }));
});

UnitTest.test('Options.sequence: None then some', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (n) => {
    const someNumbers = Arr.map(n, (x) => Option.some(x));
    Assert.eq('eq', Option.none(), Options.sequence<number>([ Option.none<number>(), ...someNumbers ]), tOption());
  }));
});

UnitTest.test('Options.sequence: all some', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (n) =>
    Assert.eq('eq',
      Options.traverse<number, number>(n, (x) => Option.some(x)),
      Options.sequence<number>(Arr.map(n, (x) => Option.some(x))),
      tOption()
    )
  ));
});
