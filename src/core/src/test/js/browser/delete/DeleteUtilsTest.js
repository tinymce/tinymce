asynctest(
  'browser.tinymce.core.delete.DeleteUtilsTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.node.Element',
    'tinymce.core.delete.DeleteUtils',
    'tinymce.core.test.ViewBlock'
  ],
  function (Assertions, Chain, GeneralSteps, Logger, Pipeline, Fun, Hierarchy, Element, DeleteUtils, ViewBlock) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var viewBlock = ViewBlock();

    var cSetHtml = function (html) {
      return Chain.op(function () {
        viewBlock.update(html);
      });
    };

    var cGetParentTextBlock = function (elementPath) {
      return Chain.mapper(function (viewBlock) {
        var element = Hierarchy.follow(Element.fromDom(viewBlock.get()), elementPath).getOrDie();
        return DeleteUtils.getParentTextBlock(Element.fromDom(viewBlock.get()), element);
      });
    };

    var cAssertBlock = function (elementPath) {
      return Chain.op(function (actualBlock) {
        var expectedBlock = Hierarchy.follow(Element.fromDom(viewBlock.get()), elementPath).getOrDie();
        Assertions.assertDomEq('Should be the expected block element', expectedBlock, actualBlock.getOrDie());
      });
    };

    var cAssertNone = Chain.op(function (actualBlock) {
      Assertions.assertEq('Should be the none but got some', true, actualBlock.isNone());
    });

    viewBlock.attach();
    Pipeline.async({}, [
      Logger.t('getParentTextBlock', GeneralSteps.sequence([
        Logger.t('Should be the paragraph block', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p>'),
          cGetParentTextBlock([0, 0]),
          cAssertBlock([0])
        ])),
        Logger.t('Should be the paragraph block inside the div', Chain.asStep(viewBlock, [
          cSetHtml('<div><p>a</p></div>'),
          cGetParentTextBlock([0, 0, 0]),
          cAssertBlock([0, 0])
        ])),
        Logger.t('Should be none in inline elements', Chain.asStep(viewBlock, [
          cSetHtml('<span>a</span>'),
          cGetParentTextBlock([0, 0]),
          cAssertNone
        ])),
        Logger.t('Should be none text nodes', Chain.asStep(viewBlock, [
          cSetHtml('a'),
          cGetParentTextBlock([0]),
          cAssertNone
        ])),
        Logger.t('Should be none on root element', Chain.asStep(viewBlock, [
          cSetHtml(''),
          cGetParentTextBlock([]),
          cAssertNone
        ]))
      ]))
    ], function () {
      viewBlock.detach();
      success();
    }, failure);
  }
);


