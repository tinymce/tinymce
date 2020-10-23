import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';
import fc from 'fast-check';
import * as Arr from 'ephox/katamari/api/Arr';
import { Optional } from 'ephox/katamari/api/Optional';
import { tOptional } from 'ephox/katamari/api/OptionalInstances';

const { tNumber } = Testable;

UnitTest.test('Arr.last: empty', () => {
  Assert.eq('empty', Optional.none<number>(), Arr.last<number>([]), tOptional(tNumber));
});

UnitTest.test('Arr.last: nonEmpty', () => {
  fc.assert(fc.property(fc.array(fc.integer()), fc.integer(), (init, last) => {
    const arr = init.concat([ last ]);
    Assert.eq('nonEmpty', Optional.some(last), Arr.last(arr), tOptional(tNumber));
  }));
});
