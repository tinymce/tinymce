asynctest(
  'browser.tinymce.core.dom.DimensionsTest',
  [
    'ephox.mcagar.api.LegacyUnit',
    'ephox.agar.api.Pipeline',
    'tinymce.core.util.Arr',
    'tinymce.core.dom.Dimensions',
    'tinymce.core.test.ViewBlock'
  ],
  function (LegacyUnit, Pipeline, Arr, Dimensions, ViewBlock) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();
    var viewBlock = new ViewBlock();

    var setupHtml = function (html) {
      viewBlock.update(html);
      return viewBlock.get();
    };

    suite.test('getClientRects', function () {
      var viewElm = setupHtml('abc<span>123</span>');

      LegacyUnit.strictEqual(Dimensions.getClientRects(viewElm.firstChild).length, 1);
      LegacyUnit.strictEqual(Dimensions.getClientRects(viewElm.lastChild).length, 1);
      LegacyUnit.equalDom(Dimensions.getClientRects(viewElm.firstChild)[0].node, viewElm.firstChild);
      LegacyUnit.strictEqual(Dimensions.getClientRects(viewElm.firstChild)[0].left > 3, true);
      LegacyUnit.strictEqual(Dimensions.getClientRects(viewElm.lastChild)[0].left > 3, true);
    });

    suite.test('getClientRects from array', function () {
      var viewElm = setupHtml('<b>a</b><b>b</b>');
      var clientRects = Dimensions.getClientRects(Arr.toArray(viewElm.childNodes));

      LegacyUnit.strictEqual(clientRects.length, 2);
      LegacyUnit.equalDom(clientRects[0].node, viewElm.childNodes[0]);
      LegacyUnit.equalDom(clientRects[1].node, viewElm.childNodes[1]);
    });

    viewBlock.attach();
    Pipeline.async({}, suite.toSteps({}), function () {
      viewBlock.detach();
      success();
    }, failure);
  }
);
