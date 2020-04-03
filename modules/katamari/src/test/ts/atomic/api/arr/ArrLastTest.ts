import * as Arr from 'ephox/katamari/api/Arr';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Option } from 'ephox/katamari/api/Option';
import { tOption } from 'ephox/katamari/api/OptionInstances';
import { Testable } from '@ephox/dispute';
import fc from 'fast-check';

const { tNumber } = Testable;

UnitTest.test('Arr.last: empty', () => {
  Assert.eq('empty', Option.none<number>(), Arr.last<number>([]), tOption(tNumber));
});

UnitTest.test('Arr.last: nonEmpty', () => {
  fc.assert(fc.property(fc.array(fc.integer()), fc.integer(), (init, last) => {
    const arr = init.concat([ last ]);
    Assert.eq('nonEmpty', Option.some(last), Arr.last(arr), tOption(tNumber));
  }));
});
