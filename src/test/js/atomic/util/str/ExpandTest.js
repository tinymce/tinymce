test(
  'Expand Test',

  [
    'ephox.phoenix.util.str.Expand'
  ],

  function (Expand) {
    var check = function (expected, text, offset) {
      var actual = Expand.word(text, offset);
      assert.eq(expected, actual);
    };

    check('', '', 0);
    check('a', ' a ', 1);
    check('two', 'two words', 1);
    check('this', 'this', 0);
    check('twas', '\'twas twas', 6);
    check('twas', '\'twas twas this', 6);
    check('twas', '\'twas(twas)this', 6);
    check('this', 'it is this', 'it is this'.length);


    check('café', 'café', 1);
  }
);
