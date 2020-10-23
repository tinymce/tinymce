import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';
import * as Obj from 'ephox/katamari/api/Obj';
import { Optional } from 'ephox/katamari/api/Optional';
import { tOptional } from 'ephox/katamari/api/OptionalInstances';

const { tArray, tNumber } = Testable;

UnitTest.test('GetTest', function () {
  Assert.eq(
    'Key exists',
    Optional.some(3),
    Obj.get({ a: 3 }, 'a'),
    tOptional(tNumber)
  );
  Assert.eq(
    'Key with null value does not exist',
    Optional.none(),
    Obj.get({ a: null }, 'a'),
    tOptional()
  );
  Assert.eq(
    'Key with undefined value does not exist',
    Optional.none(),
    Obj.get({ a: undefined }, 'a'),
    tOptional()
  );
  Assert.eq(
    'Unknown key does not exist',
    Optional.none(),
    Obj.get(<any> { a: 1 }, 'b'),
    tOptional()
  );
  Assert.eq(
    'array option array number',
    [ Optional.none<Array<number>>(), Optional.some([ 1, 8, 3, 9 ]), Optional.some([ 8, 9 ]) ],
    [ Optional.none<Array<number>>(), Optional.some([ 1, 8, 3, 9 ]), Optional.some([ 8, 9 ]) ],
    tArray(tOptional(tArray(tNumber)))
  );
});
