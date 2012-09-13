test(
  'ExtractorTest',

  [
    'ephox.compass.Arr',
    'ephox.phoenix.extract.Extract',
    'ephox.phoenix.test.Page',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Text'
  ],

  function (Arr, Extract, Page, Element, Text) {
    var check = function (expected, input) {
      var rawActual = Extract.extract(input);
      var actual = Arr.map(rawActual, function (x) {
        return x.fold(function () {
          return '\\w';
        }, function () {
          return '-';
        }, function (t) {
          return Text.get(t);
        });
      }).join('');
      assert.eq(expected, actual);
    };

    // IMPORTANT: Otherwise CSS display does not work.
    Page.connect();

    check('', Element.fromText(''));
    check('\\wFirst paragraph\\w', Page.p1);
    check('\\w\\wFirst paragraph\\w\\wSecond here is something\\w\\wMore data\\w\\w', Page.div1);
    check('\\w\\w\\wFirst paragraph\\w\\wSecond here is something\\w\\wMore data\\w\\w\\wNext \\wSection now\\w\\w\\w', Page.container);
  }
);
