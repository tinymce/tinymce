import * as Assertion from 'ephox/imagetools/test/Assertion';
import * as Mime from 'ephox/imagetools/util/Mime';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.test('MimeTest', function () {
  const check = function (expected: string | undefined, input: string) {
    const label = input;
    Assertion.assertEq(expected, Mime.guessMimeType(input), label);
  };

  check('image/jpeg', 'test.jpg');
  check('image/jpeg', 'test.jpeg');
  check('image/png', 'test.png');
  check('image/jpeg', 'test.jpg?x=png');
  check('image/jpeg', 'test.jpeg?x=png');
  check('image/png', 'test.png?x=jpg');
  check('image/jpeg', '/.png/test.jpg');
  check('image/jpeg', '/.jpeg/test.jpeg');
  check('image/png', '/.jpg/test.png');
  check(undefined, 'xyz.abc');
});
