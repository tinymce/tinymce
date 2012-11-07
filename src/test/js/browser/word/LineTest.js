test(
  'Line',

  [
    'ephox.compass.Arr',
    'ephox.robin.test.BrowserCheck',
    'ephox.robin.word.Line'
  ],

  function (Arr, BrowserCheck, Line) {
    var check = function (expected, input) {
      BrowserCheck.run(input, function (node) {
        var actual = Line.line(node);
        var actualWords = Arr.map(actual.words(), function (x) {
          return x.word();
        });

        assert.eq(expected, actualWords);
      });
    };

    check(['house', 'Not'], 'house<span class="me"><br/><br/>Not');
    check(['me'], '<span class="child">me</span>');
    check(['acat'], 'a<span class="me">c</span><span>a</span>t');
    check(['cat', 'apple', 'really', 'I'], '<div class="me"><p>cat</p><p>apple <span style="font-style: italic; ">really</span> </p><p><span class="hil"></span>I &nbsp;</p></div>');
  }
);