test('Pad',

  [
    'ephox.katamari.api.Strings'
  ],

  function(Strings) {
    var check = function(expectedLeft, expectedRight, input, c, width) {
      assert.eq(expectedLeft,  Strings.padLeft (input, c, width));
      assert.eq(expectedRight, Strings.padRight(input, c, width));
    };

    check('', '', '', '#', 0);
    check('#', '#', '#', '#', 0);
    check('#', '#', '#', 'q', 0);
    check('#', '#', '#', 'q', 1);

    check('#q', 'q#', 'q', '#', 2);
    check('##q', 'q##', 'q', '#', 3);
    check('###q', 'q###', 'q', '#', 4);

    check('#qr', 'qr#', 'qr', '#', 3);
    check('##qr', 'qr##', 'qr', '#', 4);
    check('###qr', 'qr###', 'qr', '#', 5);

    check('', '', '', '#', 0);
    check('#', '#', '', '#', 1);
    check('##', '##', '', '#', 2);
    check('###', '###', '', '#', 3);
  }
);
