import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as Options from 'ephox/katamari/api/Options';
import { Option } from 'ephox/katamari/api/Option';
import { tOption } from 'ephox/katamari/api/OptionInstances';
import { Testable } from '@ephox/dispute';

const { tNumber, tString, tArray } = Testable;

UnitTest.test('Options.traverse - unit tests', () => {
  Assert.eq(
    'traverse empty array is some empty array',
    Option.some([]),
    Options.traverse<number, string>(
      [],
      (_x: number): Option<string> => {
        throw Error('no');
      }
    ),
    tOption(tArray(tString))
  );

  Assert.eq(
    'traverse array to some',
    Option.some([ '3cat' ]),
    Options.traverse<number, string>(
      [ 3 ],
      (x: number): Option<string> => Option.some(x + 'cat')
    ),
    tOption(tArray(tString))
  );

  Assert.eq(
    'traverse array to none',
    Option.none(),
    Options.traverse<number, string>(
      [ 3 ],
      (_x: number): Option<string> => Option.none()
    ),
    tOption(tArray(tString)));

  Assert.eq('traverse array to someIf',
    Option.none(),
    Options.traverse<number, number>(
      [ 3, 4 ],
      (x: number): Option<number> => Options.someIf(x === 3, x)
    ),
    tOption(tArray(tNumber))
  );
});
