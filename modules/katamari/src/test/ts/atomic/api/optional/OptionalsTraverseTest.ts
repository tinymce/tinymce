import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';
import { Optional } from 'ephox/katamari/api/Optional';
import { tOptional } from 'ephox/katamari/api/OptionalInstances';
import * as Optionals from 'ephox/katamari/api/Optionals';

const { tNumber, tString, tArray } = Testable;

UnitTest.test('Optionals.traverse - unit tests', () => {
  Assert.eq(
    'traverse empty array is some empty array',
    Optional.some([]),
    Optionals.traverse<number, string>(
      [],
      (_x: number): Optional<string> => {
        throw Error('no');
      }
    ),
    tOptional(tArray(tString))
  );

  Assert.eq(
    'traverse array to some',
    Optional.some([ '3cat' ]),
    Optionals.traverse<number, string>(
      [ 3 ],
      (x: number): Optional<string> => Optional.some(x + 'cat')
    ),
    tOptional(tArray(tString))
  );

  Assert.eq(
    'traverse array to none',
    Optional.none(),
    Optionals.traverse<number, string>(
      [ 3 ],
      (_x: number): Optional<string> => Optional.none()
    ),
    tOptional(tArray(tString)));

  Assert.eq('traverse array to someIf',
    Optional.none(),
    Optionals.traverse<number, number>(
      [ 3, 4 ],
      (x: number): Optional<number> => Optionals.someIf(x === 3, x)
    ),
    tOptional(tArray(tNumber))
  );
});
