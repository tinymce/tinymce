test(
  'PreviousWordTest',

  [
    'ephox.perhaps.Option',
    'ephox.robin.context.PreviousWord',
    'ephox.robin.test.Assertions',
    'ephox.robin.test.BrowserCheck'
  ],

  function (Option, PreviousWord, Assertions, BrowserCheck) {

    var check = function (expected, input, offset) {
      BrowserCheck.run(input, function (node) {
        var actual = PreviousWord.prevWord(node, offset);
        Assertions.assertOptComp(expected, actual, function (a, b) {
          assert.eq(a.text, b.text());
          assert.eq(a.offset, b.offset());
        });
      });
    };

    check(Option.some({
      text: 'this',
      offset: 0
    }), '<div><span class="child">this</span></div>', 4);

    check(Option.none(), '<div><span class="child">this</span></div>', 3);
    check(Option.none(), '<div><span class="child">thist</span></div>', 4);

    check(Option.some({
      text: 'this',
      offset: 0
    }), '<div><span class="child">this </span></div>', 4);

    check(Option.some({
      text: '',
      offset: 5
    }), '<div><span class="child">this </span></div>', 5);

    check(Option.some({
      text: 'mogel',
      offset: 3 // gathering means that the whitespace is included making this 2. Hmm
    }), '<span>   mog</span><span class="child">el</span>', 2);

  }
);
