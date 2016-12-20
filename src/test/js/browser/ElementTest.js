test(
  'ElementTest',

  [
    'ephox.sugar.api.node.Element',
    'global!document'
  ],

  function (Element, document) {
    var checkErr = function (f, val) {
      try {
        f(val);
      } catch (e) {
        // expected
        return;
      }
      assert.fail('function did not throw an error');
    };

    var checkEl = function (f, el, expt) {
      var element = f(el);
      assert.eq(true, expt === element.dom());
    };

    checkErr(Element.fromDom, undefined);
    checkErr(Element.fromDom, null);
    checkEl(Element.fromDom, document.body, document.body);

  }
);