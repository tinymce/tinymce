import * as Obj from 'ephox/katamari/api/Obj';
import { Option } from 'ephox/katamari/api/Option';
import { tOption } from 'ephox/katamari/api/OptionInstances';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';

const { tArray, tNumber } = Testable;

UnitTest.test('GetTest', function () {
  Assert.eq(
    'Key exists',
    Option.some(3),
    Obj.get({ a: 3 }, 'a'),
    tOption(tNumber)
  );
  Assert.eq(
    'Key with null value does not exist',
    Option.none(),
    Obj.get({ a: null }, 'a'),
    tOption()
  );
  Assert.eq(
    'Key with undefined value does not exist',
    Option.none(),
    Obj.get({ a: undefined }, 'a'),
    tOption()
  );
  Assert.eq(
    'Unknown key does not exist',
    Option.none(),
    Obj.get(<any> { a: 1 }, 'b'),
    tOption()
  );
  Assert.eq(
    'array option array number',
    [ Option.none<Array<number>>(), Option.some([ 1, 8, 3, 9 ]), Option.some([ 8, 9 ]) ],
    [ Option.none<Array<number>>(), Option.some([ 1, 8, 3, 9 ]), Option.some([ 8, 9 ]) ],
    tArray(tOption(tArray(tNumber)))
  );
});
