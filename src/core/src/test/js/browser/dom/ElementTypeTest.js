asynctest(
  'browser.tinymce.core.dom.ElementTypeTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.sugar.api.node.Element',
    'tinymce.core.dom.ElementType'
  ],
  function (Assertions, GeneralSteps, Logger, Pipeline, Step, Element, ElementType) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var sCheckElement = function (name, predicate, expectedValue) {
      return Step.sync(function () {
        Assertions.assertEq('Should be the expected value for specified element', expectedValue, predicate(Element.fromTag(name)));
      });
    };

    var sCheckText = function (predicate) {
      return Step.sync(function () {
        Assertions.assertEq('Should be false for non element', false, predicate(Element.fromText('text')));
      });
    };

    Pipeline.async({}, [
      Logger.t('Check block elements', GeneralSteps.sequence([
        sCheckElement('p', ElementType.isBlock, true),
        sCheckElement('h1', ElementType.isBlock, true),
        sCheckElement('table', ElementType.isBlock, true),
        sCheckElement('span', ElementType.isBlock, false),
        sCheckElement('b', ElementType.isBlock, false),
        sCheckText(ElementType.isBlock)
      ])),
      Logger.t('Check inline elements', GeneralSteps.sequence([
        sCheckElement('b', ElementType.isInline, true),
        sCheckElement('span', ElementType.isInline, true),
        sCheckElement('p', ElementType.isInline, false),
        sCheckElement('h1', ElementType.isInline, false),
        sCheckText(ElementType.isInline)
      ])),
      Logger.t('Check heading elements', GeneralSteps.sequence([
        sCheckElement('h1', ElementType.isHeading, true),
        sCheckElement('h2', ElementType.isHeading, true),
        sCheckElement('span', ElementType.isHeading, false),
        sCheckElement('table', ElementType.isHeading, false),
        sCheckText(ElementType.isHeading)
      ])),
      Logger.t('Check text block elements', GeneralSteps.sequence([
        sCheckElement('p', ElementType.isTextBlock, true),
        sCheckElement('h1', ElementType.isTextBlock, true),
        sCheckElement('table', ElementType.isTextBlock, false),
        sCheckText(ElementType.isTextBlock)
      ])),
      Logger.t('Check void elements', GeneralSteps.sequence([
        sCheckElement('img', ElementType.isVoid, true),
        sCheckElement('hr', ElementType.isVoid, true),
        sCheckElement('h1', ElementType.isVoid, false),
        sCheckElement('span', ElementType.isVoid, false),
        sCheckText(ElementType.isVoid)
      ])),
      Logger.t('Check table cell elements', GeneralSteps.sequence([
        sCheckElement('th', ElementType.isTableCell, true),
        sCheckElement('td', ElementType.isTableCell, true),
        sCheckElement('h1', ElementType.isTableCell, false),
        sCheckElement('span', ElementType.isTableCell, false),
        sCheckText(ElementType.isTableCell)
      ]))
    ], function () {
      success();
    }, failure);
  }
);
