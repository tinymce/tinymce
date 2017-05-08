asynctest(
  'browser.tinymce.core.CaretFinderTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.node.Element',
    'tinymce.core.caret.CaretFinder',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.test.ViewBlock'
  ],
  function (Assertions, Chain, GeneralSteps, Logger, Pipeline, Step, Hierarchy, Element, CaretFinder, CaretPosition, ViewBlock) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var viewBlock = new ViewBlock();

    var cSetHtml = function (html) {
      return Chain.op(function () {
        viewBlock.update(html);
      });
    };

    var cCreateFromPosition = function (path, offset) {
      return Chain.mapper(function (viewBlock) {
        var container = Hierarchy.follow(Element.fromDom(viewBlock.get()), path).getOrDie();
        return new CaretPosition(container.dom(), offset);
      });
    };

    var cAssertCaretPosition = function (path, offset) {
      return Chain.op(function (posOption) {
        var pos = posOption.getOrDie();
        var container = Hierarchy.follow(Element.fromDom(viewBlock.get()), path).getOrDie();
        Assertions.assertDomEq('Should be the expected container', Element.fromDom(pos.container()), container);
        Assertions.assertEq('Should be the expected offset', pos.offset(), offset);
      });
    };

    var cAssertNone = Chain.op(function (pos) {
      Assertions.assertEq('Should be the none but got some', true, pos.isNone());
    });

    var cFromPosition = function (forward) {
      return Chain.mapper(function (from) {
        return CaretFinder.fromPosition(forward, viewBlock.get(), from);
      });
    };

    var cPositionIn = function (forward, path) {
      return Chain.mapper(function (_) {
        var element = Hierarchy.follow(Element.fromDom(viewBlock.get()), path).getOrDie();
        return CaretFinder.positionIn(forward, element.dom());
      });
    };

    viewBlock.attach();
    Pipeline.async({}, [
      Logger.t('fromPosition', GeneralSteps.sequence([
        Logger.t('Should walk to first text node offset', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p>'),
          cCreateFromPosition([], 0),
          cFromPosition(true),
          cAssertCaretPosition([0, 0], 0)
        ])),
        Logger.t('Should walk to last text node offset', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p>'),
          cCreateFromPosition([], 1),
          cFromPosition(false),
          cAssertCaretPosition([0, 0], 1)
        ])),
        Logger.t('Should walk to from text node offset 0 to 1', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p>'),
          cCreateFromPosition([0, 0], 0),
          cFromPosition(true),
          cAssertCaretPosition([0, 0], 1)
        ])),
        Logger.t('Should walk to from text node offset 1 to 0', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p>'),
          cCreateFromPosition([0, 0], 1),
          cFromPosition(false),
          cAssertCaretPosition([0, 0], 0)
        ])),
        Logger.t('Should not walk anywhere since there is nothing to walk to', Chain.asStep(viewBlock, [
          cSetHtml(''),
          cCreateFromPosition([], 0),
          cFromPosition(false),
          cAssertNone
        ]))
      ])),

      Logger.t('positionIn', GeneralSteps.sequence([
        Logger.t('Should walk to first text node offset', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p>'),
          cPositionIn(true, [0]),
          cAssertCaretPosition([0, 0], 0)
        ])),
        Logger.t('Should walk to last text node offset', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p>'),
          cPositionIn(false, [0]),
          cAssertCaretPosition([0, 0], 1)
        ])),
        Logger.t('Should walk to first element offset', Chain.asStep(viewBlock, [
          cSetHtml('<p><input></p>'),
          cPositionIn(true, [0]),
          cAssertCaretPosition([0], 0)
        ])),
        Logger.t('Should walk to last element offset', Chain.asStep(viewBlock, [
          cSetHtml('<p><input></p>'),
          cPositionIn(false, [0]),
          cAssertCaretPosition([0], 1)
        ])),
        Logger.t('Should walk to last element offset skip br', Chain.asStep(viewBlock, [
          cSetHtml('<p><input><br></p>'),
          cPositionIn(false, [0]),
          cAssertCaretPosition([0], 1)
        ])),
        Logger.t('Should walk to first inner element offset', Chain.asStep(viewBlock, [
          cSetHtml('<p><b><input></b></p>'),
          cPositionIn(true, [0]),
          cAssertCaretPosition([0, 0], 0)
        ])),
        Logger.t('Should walk to last inner element offset', Chain.asStep(viewBlock, [
          cSetHtml('<p><b><input></b></p>'),
          cPositionIn(false, [0]),
          cAssertCaretPosition([0, 0], 1)
        ])),
        Logger.t('Should not find any position in an empty element', Chain.asStep(viewBlock, [
          cSetHtml('<p></p>'),
          cPositionIn(true, [0]),
          cAssertNone
        ])),
        Logger.t('Should not find any position in an empty element', Chain.asStep(viewBlock, [
          cSetHtml('<p></p>'),
          cPositionIn(false, [0]),
          cAssertNone
        ]))
      ]))
    ], function () {
      viewBlock.detach();
      success();
    }, failure);
  }
);
