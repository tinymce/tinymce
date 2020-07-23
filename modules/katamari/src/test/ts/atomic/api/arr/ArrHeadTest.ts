import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';
import * as Arr from 'ephox/katamari/api/Arr';
import { Optional } from 'ephox/katamari/api/Optional';
import { tOptional } from 'ephox/katamari/api/OptionalInstances';
import fc from 'fast-check';

const { tNumber } = Testable;

UnitTest.test('Arr.head: empty', () => {
  Assert.eq('empty', Optional.none<number>(), Arr.head<number>([]), tOptional(tNumber));
});

UnitTest.test('Arr.head: nonEmpty', () => {
  fc.assert(fc.property(fc.array(fc.integer()), fc.integer(), (t, h) => {
    const arr = [ h ].concat(t);
    Assert.eq('nonEmpty', Optional.some(h), Arr.head(arr), tOptional(tNumber));
  }));
});
