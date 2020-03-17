import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Option } from '@ephox/katamari';
import * as CurrentWord from 'ephox/robin/util/CurrentWord';

UnitTest.test('CurrentWordTest', function () {
  const check = function (expected: { before: Option<number>; after: Option<number> }, text: string, position: number) {
    const actual = CurrentWord.around(text, position);
    Assert.eq(
      'Checking before :: Option',
      (expected.before as Option<number | string>).getOr('none'),
      (actual.before() as Option<number | string>).getOr('none')
    );
    Assert.eq(
      'Checking after :: Option',
      (expected.after as Option<number | string>).getOr('none'),
      (actual.after() as Option<number | string>).getOr('none')
    );
  };

  check({ before: Option.some(' this is a '.length), after: Option.some(' this is a test'.length) },
    ' this is a test case', ' this is a t'.length);
  check({ before: Option.some(' this is a test '.length), after: Option.none() },
    ' this is a test case', ' this is a test ca'.length);

  check({ before: Option.some(' this is a test'.length), after: Option.some(' this is a test'.length) },
    ' this is a test case', ' this is a test'.length);
  check({ before: Option.some(' this is a test '.length), after: Option.none() },
    ' this is a test case', ' this is a test case'.length);
  check({ before: Option.some(16), after: Option.none() }, ' this is a test case', ' this is a test ca'.length);
});
