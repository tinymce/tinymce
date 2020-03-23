import * as Arr from 'ephox/katamari/api/Arr';
import { Option } from 'ephox/katamari/api/Option';
import { tOption } from 'ephox/katamari/api/OptionInstances';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import { Testable } from '@ephox/dispute';

const { tNumber } = Testable;

UnitTest.test('Arr.head: empty', () => {
  Assert.eq('empty', Option.none<number>(), Arr.head<number>([]), tOption(tNumber));
});

UnitTest.test('Arr.head: nonEmpty', () => {
  fc.assert(fc.property(fc.array(fc.integer()), fc.integer(), (t, h) => {
    const arr = [ h ].concat(t);
    Assert.eq('nonEmpty', Option.some(h), Arr.head(arr), tOption(tNumber));
  }));
});
