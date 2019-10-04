import { assert, UnitTest } from '@ephox/bedrock';
import * as Arr from 'ephox/katamari/api/Arr';
import * as Options from 'ephox/katamari/api/Options';
import { Option } from 'ephox/katamari/api/Option';
import Jsc from '@ephox/wrap-jsverify';

UnitTest.test('Options.sequence - unit tests', () => {
  assert.eq([], Options.sequence<number>([]).getOrDie());
  assert.eq([3], Options.sequence<number>([Option.some(3)]).getOrDie());
  assert.eq([1, 2], Options.sequence<number>([Option.some(1), Option.some(2)]).getOrDie());

  assert.eq(true, Options.sequence<number>([Option.some(1), Option.none()]).isNone());
  assert.eq(true, Options.sequence<number>([Option.none(), Option.some(343)]).isNone());
});

UnitTest.test('Options.sequence - property tests', () => {
  Jsc.property('Single some value', 'number', (n: number) =>
    Jsc.eq([n], Options.sequence<number>([Option.some<number>(n)]).getOrDie())
  );

  Jsc.property('Two some values', 'number', 'number', (n: number, m: number) =>
    Jsc.eq([n, m], Options.sequence<number>([Option.some(n), Option.some(m)]).getOrDie())
  );

  Jsc.property('Array of numbers', 'array number', (n: number[]) => {
    const someNumbers = Arr.map(n, (x) => Option.some(x));
    return Jsc.eq(n, Options.sequence<number>(someNumbers).getOrDie());
  });

  Jsc.property('Some then none', 'array number', (n: number[]) => {
    const someNumbers = Arr.map(n, (x) => Option.some(x));
    return Jsc.eq(true, Options.sequence<number>([...someNumbers, Option.none<number>()]).isNone());
  });

  Jsc.property('None then some', 'array number', (n: number[]) => {
    const someNumbers = Arr.map(n, (x) => Option.some(x));
    return Jsc.eq(true, Options.sequence<number>([Option.none<number>(), ...someNumbers]).isNone());
  });
});

UnitTest.test('Options.sequence - sequence-map-some is traverse-some', () => {
  Jsc.property('all some', 'array number', (n: number[]) =>
    Jsc.eq(
      Options.traverse<number, number>(n, (x) => Option.some(x)).getOrDie(),
      Options.sequence<number>(Arr.map(n, (x) => Option.some(x))).getOrDie())
  );
});
