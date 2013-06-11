test(
  'words :: Cluster',

  [
    'ephox.compass.Arr',
    'ephox.robin.api.dom.Words',
    'ephox.robin.test.BrowserCheck'
  ],

  function (Arr, Words, BrowserCheck) {
    var check = function (expected, input, f) {
      BrowserCheck.run(input, function (node) {
        var actual = f(node);
        var actualWords = Arr.map(actual.words(), function (x) {
          return x.word();
        });

        assert.eq(expected, actualWords);
      });
    };

    var checkLocal = function (expected, input) {
      check(expected, input, Words.cluster);
    };

    checkLocal(['house', 'Not'], 'house<span class="me"><br/><br/>Not');
    checkLocal(['me'], '<span class="child">me</span>');
    checkLocal(['acat'], 'a<span class="me">c</span><span>a</span>t');
    checkLocal([], '<div class="me"><p>cat</p><p>apple <span style="font-style: italic; ">really</span> </p><p><span class="hil"></span>I &nbsp;</p></div>');
  }
);