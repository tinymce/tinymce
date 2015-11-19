test(
  'MimeTest',

  [
    'ephox/imagetools/test/Assertion',
    'ephox/imagetools/util/Mime'
  ],

  function (Assertion, Mime) {

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
  }
);