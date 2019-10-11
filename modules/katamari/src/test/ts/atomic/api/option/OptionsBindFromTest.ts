import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as Options from 'ephox/katamari/api/Options';
import { Option } from 'ephox/katamari/api/Option';
import { tOption } from 'ephox/katamari/api/OptionInstances';
import * as Fun from 'ephox/katamari/api/Fun';
import { Testable } from '@ephox/dispute';

const { tNumber } = Testable;

UnitTest.test('Options.bindFrom', () => {
  Assert.eq('bindFrom value to some', Option.some(4), Options.bindFrom(3, (x) => Option.some(x + 1)), tOption(tNumber));
  Assert.eq('bindFrom value to none', Option.none(), Options.bindFrom(3, (x) => Option.none()), tOption(tNumber));
  Assert.eq('bindFrom null', Option.none(), Options.bindFrom<number, number>(null, Fun.die('boom')), tOption());
  Assert.eq('bindFrom undefined', Option.none(), Options.bindFrom<number, number>(undefined, Fun.die('boom')), tOption(tNumber));
});

UnitTest.test('Options.bindFrom === Options.bind().from()', () => {
  const check = (input: number | null | undefined, f: (a: number) => Option<number>) => {
    Assert.eq('bindFrom equivalent ot bind', Option.from(input).bind(f), Options.bindFrom(input, f), tOption(tNumber));
  };

  const s = (x: number) => Option.some<number>(x + 1);
  const n = (x: number) => Option.none<number>();

  check(3, s);
  check(null, s);
  check(undefined, s);

  check(3, n);
  check(null, n);
  check(undefined, n);
});
