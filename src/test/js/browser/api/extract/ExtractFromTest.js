test(
  'api.DomExtract.from',

  [
    'ephox.compass.Arr',
    'ephox.phoenix.api.dom.DomExtract',
    'ephox.phoenix.test.Page',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Text'
  ],

  function (Arr, DomExtract, Page, Element, Text) {
    var check = function (expected, input) {
      var rawActual = DomExtract.from(input);
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
    var page = Page();
    page.connect();

    check('', Element.fromText(''));
    check('\\wFirst paragraph\\w', page.p1);
    check('\\w\\wFirst paragraph\\w\\wSecond here is something\\w\\wMore data\\w\\w', page.div1);
    check('\\w\\w\\wFirst paragraph\\w\\wSecond here is something\\w\\wMore data\\w\\w\\wNext \\wSection now\\w\\w\\w', page.container);

    page.disconnect();
  }
);