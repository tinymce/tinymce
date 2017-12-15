import Assertion from 'ephox/imagetools/test/Assertion';
import Mime from 'ephox/imagetools/util/Mime';
import { UnitTest } from '@ephox/bedrock';

UnitTest.test('MimeTest', function() {
  var check = function (expected, input) {
    var label = input;
    Assertion.assertEq(expected, Mime.guessMimeType(input), label);
  };

  check('image/jpeg', 'test.jpg');
  check("image/jpeg", "test.jpeg");
  check("image/png", "test.png");
  check("image/jpeg", "test.jpg?x=png");
  check("image/jpeg", "test.jpeg?x=png");
  check("image/png", "test.png?x=jpg");
  check("image/jpeg", "/.png/test.jpg");
  check("image/jpeg", "/.jpeg/test.jpeg");
  check("image/png", "/.jpg/test.png");
  check(undefined, "xyz.abc");
});

