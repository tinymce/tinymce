asynctest(
  'browser.tinymce.core.keyboard.InlineUtilsTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.node.Element',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.keyboard.InlineUtils',
    'tinymce.core.text.Zwsp'
  ],
  function (Assertions, Chain, GeneralSteps, Logger, Pipeline, Step, Hierarchy, Element, CaretPosition, InlineUtils, Zwsp) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var ZWSP = Zwsp.ZWSP;

    var cCreateElement = function (html) {
      return Chain.mapper(function (_) {
        return Element.fromHtml(html);
      });
    };

    var cNormalizePosition = function (forward, path, offset) {
      return Chain.mapper(function (elm) {
        var container = Hierarchy.follow(elm, path).getOrDie();
        var pos = new CaretPosition(container.dom(), offset);
        return { pos: InlineUtils.normalizePosition(forward, pos), elm: elm };
      });
    };

    var cAssertPosition = function (path, expectedOffset) {
      return Chain.mapper(function (elmPos) {
        var expectedContainer = Hierarchy.follow(elmPos.elm, path).getOrDie();
        Assertions.assertDomEq('Should be expected container', Element.fromDom(elmPos.pos.container()), expectedContainer);
        Assertions.assertEq('Should be expected offset', elmPos.pos.offset(), expectedOffset);
        return {};
      });
    };

    var cSplitAt = function (path, offset) {
      return Chain.mapper(function (elm) {
        var textNode = Hierarchy.follow(elm, path).getOrDie();
        textNode.dom().splitText(offset);
        return elm;
      });
    };

    Pipeline.async({}, [
      Logger.t('normalizePosition on text forwards', GeneralSteps.sequence([
        Logger.t('normalizePosition start of zwsp before text', Chain.asStep({}, [
          cCreateElement('<p>' + ZWSP + 'a</p>'),
          cNormalizePosition(true, [0], 0),
          cAssertPosition([0], 1)
        ])),
        Logger.t('normalizePosition end of zwsp before text', Chain.asStep({}, [
          cCreateElement('<p>' + ZWSP + 'a</p>'),
          cNormalizePosition(true, [0], 1),
          cAssertPosition([0], 1)
        ])),
        Logger.t('normalizePosition start of zwsp after text', Chain.asStep({}, [
          cCreateElement('<p>a' + ZWSP + '</p>'),
          cNormalizePosition(true, [0], 1),
          cAssertPosition([0], 2)
        ])),
        Logger.t('normalizePosition end of zwsp after text', Chain.asStep({}, [
          cCreateElement('<p>a' + ZWSP + '</p>'),
          cNormalizePosition(true, [0], 2),
          cAssertPosition([0], 2)
        ]))
      ])),

      Logger.t('normalizePosition on text backwards', GeneralSteps.sequence([
        Logger.t('normalizePosition end of zwsp after text', Chain.asStep({}, [
          cCreateElement('<p>a' + ZWSP + '</p>'),
          cNormalizePosition(false, [0], 2),
          cAssertPosition([0], 1)
        ])),
        Logger.t('normalizePosition start of zwsp after text', Chain.asStep({}, [
          cCreateElement('<p>a' + ZWSP + '</p>'),
          cNormalizePosition(false, [0], 1),
          cAssertPosition([0], 1)
        ])),
        Logger.t('normalizePosition end of zwsp before text', Chain.asStep({}, [
          cCreateElement('<p>' + ZWSP + 'a</p>'),
          cNormalizePosition(false, [0], 1),
          cAssertPosition([0], 0)
        ])),
        Logger.t('normalizePosition start of zwsp before text', Chain.asStep({}, [
          cCreateElement('<p>' + ZWSP + 'a</p>'),
          cNormalizePosition(false, [0], 0),
          cAssertPosition([0], 0)
        ]))
      ])),

      Logger.t('normalizePosition on element forwards', GeneralSteps.sequence([
        Logger.t('normalizePosition start of zwsp before element', Chain.asStep({}, [
          cCreateElement('<p>' + ZWSP + '<input></p>'),
          cNormalizePosition(true, [0], 0),
          cAssertPosition([], 1)
        ])),
        Logger.t('normalizePosition end of zwsp before element', Chain.asStep({}, [
          cCreateElement('<p>' + ZWSP + '<input></p>'),
          cNormalizePosition(true, [0], 1),
          cAssertPosition([], 1)
        ])),
        Logger.t('normalizePosition start of zwsp after element', Chain.asStep({}, [
          cCreateElement('<p><input>' + ZWSP + '</p>'),
          cNormalizePosition(true, [1], 0),
          cAssertPosition([], 2)
        ])),
        Logger.t('normalizePosition end of zwsp after element', Chain.asStep({}, [
          cCreateElement('<p><input>' + ZWSP + '</p>'),
          cNormalizePosition(true, [1], 1),
          cAssertPosition([], 2)
        ]))
      ])),

      Logger.t('normalizePosition on element backwards', GeneralSteps.sequence([
        Logger.t('normalizePosition end of zwsp after element', Chain.asStep({}, [
          cCreateElement('<p><input>' + ZWSP + '</p>'),
          cNormalizePosition(false, [1], 1),
          cAssertPosition([], 1)
        ])),
        Logger.t('normalizePosition start of zwsp after element', Chain.asStep({}, [
          cCreateElement('<p><input>' + ZWSP + '</p>'),
          cNormalizePosition(false, [1], 0),
          cAssertPosition([], 1)
        ])),
        Logger.t('normalizePosition end of zwsp before element', Chain.asStep({}, [
          cCreateElement('<p>' + ZWSP + '<input></p>'),
          cNormalizePosition(false, [0], 1),
          cAssertPosition([], 0)
        ])),
        Logger.t('normalizePosition start of zwsp before element', Chain.asStep({}, [
          cCreateElement('<p>' + ZWSP + '<input></p>'),
          cNormalizePosition(false, [0], 0),
          cAssertPosition([], 0)
        ]))
      ])),

      Logger.t('normalizePosition on text forwards', GeneralSteps.sequence([
        Logger.t('normalizePosition start of zwsp before text', Chain.asStep({}, [
          cCreateElement('<p>' + ZWSP + 'a</p>'),
          cSplitAt([0], 1),
          cNormalizePosition(true, [0], 0),
          cAssertPosition([1], 0)
        ])),
        Logger.t('normalizePosition end of zwsp before text', Chain.asStep({}, [
          cCreateElement('<p>' + ZWSP + 'a</p>'),
          cSplitAt([0], 1),
          cNormalizePosition(true, [0], 1),
          cAssertPosition([1], 0)
        ])),
        Logger.t('normalizePosition start of zwsp after text', Chain.asStep({}, [
          cCreateElement('<p>a' + ZWSP + '</p>'),
          cSplitAt([0], 1),
          cNormalizePosition(true, [1], 0),
          cAssertPosition([], 2)
        ])),
        Logger.t('normalizePosition end of zwsp after text', Chain.asStep({}, [
          cCreateElement('<p>a' + ZWSP + '</p>'),
          cSplitAt([0], 1),
          cNormalizePosition(true, [1], 1),
          cAssertPosition([], 2)
        ]))
      ]))
    ], function () {
      success();
    }, failure);
  }
);