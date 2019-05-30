import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { Element } from '@ephox/sugar';
import * as ElementType from 'tinymce/core/dom/ElementType';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.dom.ElementTypeTest', (success, failure) => {
  const sCheckElement = function (name, predicate, expectedValue) {
    return Step.sync(function () {
      Assertions.assertEq('Should be the expected value for specified element', expectedValue, predicate(Element.fromTag(name)));
    });
  };

  const sCheckText = function (predicate) {
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
    Logger.t('Check tables', GeneralSteps.sequence([
      sCheckElement('b', ElementType.isTable, false),
      sCheckElement('p', ElementType.isTable, false),
      sCheckElement('table', ElementType.isTable, true),
      sCheckText(ElementType.isTable)
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
    ])),
    Logger.t('Check br elements', GeneralSteps.sequence([
      sCheckElement('br', ElementType.isBr, true),
      sCheckElement('b', ElementType.isBr, false),
      sCheckText(ElementType.isBr)
    ])),
    Logger.t('Check list item elements', GeneralSteps.sequence([
      sCheckElement('br', ElementType.isListItem, false),
      sCheckElement('div', ElementType.isListItem, false),
      sCheckElement('li', ElementType.isListItem, true),
      sCheckElement('dd', ElementType.isListItem, true),
      sCheckElement('dt', ElementType.isListItem, true),
      sCheckText(ElementType.isListItem)
    ])),
    Logger.t('Check list elements', GeneralSteps.sequence([
      sCheckElement('br', ElementType.isList, false),
      sCheckElement('div', ElementType.isList, false),
      sCheckElement('ul', ElementType.isList, true),
      sCheckElement('ol', ElementType.isList, true),
      sCheckElement('dl', ElementType.isList, true),
      sCheckText(ElementType.isList)
    ])),
    Logger.t('Check table section elements', GeneralSteps.sequence([
      sCheckElement('br', ElementType.isTableSection, false),
      sCheckElement('div', ElementType.isTableSection, false),
      sCheckElement('thead', ElementType.isTableSection, true),
      sCheckElement('tbody', ElementType.isTableSection, true),
      sCheckElement('tfoot', ElementType.isTableSection, true),
      sCheckText(ElementType.isTableSection)
    ])),
    Logger.t('Check whitespace preserve elements', GeneralSteps.sequence([
      sCheckElement('br', ElementType.isWsPreserveElement, false),
      sCheckElement('div', ElementType.isWsPreserveElement, false),
      sCheckElement('pre', ElementType.isWsPreserveElement, true),
      sCheckElement('textarea', ElementType.isWsPreserveElement, true),
      sCheckText(ElementType.isWsPreserveElement)
    ]))
  ], function () {
    success();
  }, failure);
});
