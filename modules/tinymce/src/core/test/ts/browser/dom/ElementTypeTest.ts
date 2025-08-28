import { describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import * as ElementType from 'tinymce/core/dom/ElementType';

describe('browser.tinymce.core.dom.ElementTypeTest', () => {
  const checkElement = (name: string, predicate: (elm: SugarElement<Node>) => boolean, expectedValue: boolean) => {
    assert.equal(predicate(SugarElement.fromTag(name)), expectedValue, 'Should be the expected value for specified element');
  };

  const checkText = (predicate: (elm: SugarElement<Node>) => boolean) => {
    assert.isFalse(predicate(SugarElement.fromText('text')), 'Should be false for non element');
  };

  it('Check tables', () => {
    checkElement('b', ElementType.isTable, false);
    checkElement('p', ElementType.isTable, false);
    checkElement('table', ElementType.isTable, true);
    checkText(ElementType.isTable);
  });

  it('Check text block elements', () => {
    checkElement('p', ElementType.isTextBlock, true);
    checkElement('h1', ElementType.isTextBlock, true);
    checkElement('table', ElementType.isTextBlock, false);
    checkText(ElementType.isTextBlock);
  });

  it('Check table cell elements', () => {
    checkElement('th', ElementType.isTableCell, true);
    checkElement('td', ElementType.isTableCell, true);
    checkElement('h1', ElementType.isTableCell, false);
    checkElement('span', ElementType.isTableCell, false);
    checkText(ElementType.isTableCell);
  });

  it('Check br elements', () => {
    checkElement('br', ElementType.isBr, true);
    checkElement('b', ElementType.isBr, false);
    checkText(ElementType.isBr);
  });

  it('Check list item elements', () => {
    checkElement('br', ElementType.isListItem, false);
    checkElement('div', ElementType.isListItem, false);
    checkElement('li', ElementType.isListItem, true);
    checkElement('dd', ElementType.isListItem, true);
    checkElement('dt', ElementType.isListItem, true);
    checkText(ElementType.isListItem);
  });

  it('Check list elements', () => {
    checkElement('br', ElementType.isList, false);
    checkElement('div', ElementType.isList, false);
    checkElement('ul', ElementType.isList, true);
    checkElement('ol', ElementType.isList, true);
    checkElement('dl', ElementType.isList, true);
    checkText(ElementType.isList);
  });

  it('Check table section elements', () => {
    checkElement('br', ElementType.isTableSection, false);
    checkElement('div', ElementType.isTableSection, false);
    checkElement('thead', ElementType.isTableSection, true);
    checkElement('tbody', ElementType.isTableSection, true);
    checkElement('tfoot', ElementType.isTableSection, true);
    checkText(ElementType.isTableSection);
  });

  it('Check whitespace preserve elements', () => {
    checkElement('br', ElementType.isWsPreserveElement, false);
    checkElement('div', ElementType.isWsPreserveElement, false);
    checkElement('pre', ElementType.isWsPreserveElement, true);
    checkElement('textarea', ElementType.isWsPreserveElement, true);
    checkText(ElementType.isWsPreserveElement);
  });
});
