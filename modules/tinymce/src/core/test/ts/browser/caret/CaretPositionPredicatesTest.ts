import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import CaretPosition from 'tinymce/core/caret/CaretPosition';
import { isAfterContentEditableFalse, isBeforeContentEditableFalse, isEmptyText } from 'tinymce/core/caret/CaretPositionPredicates';
import { ZWSP } from 'tinymce/core/text/Zwsp';

import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.CaretPositionPredicateTest', () => {
  const viewBlock = ViewBlock.bddSetup();

  const getRoot = viewBlock.get;
  const setupHtml = viewBlock.update;

  it('TBA: isBeforeContentEditableFalse', () => {
    setupHtml(
      '<span contentEditable="false"></span>' +
      '<span contentEditable="false"></span>a'
    );

    assert.isTrue(isBeforeContentEditableFalse(CaretPosition(getRoot(), 0)));
    assert.isTrue(isBeforeContentEditableFalse(CaretPosition(getRoot(), 1)));
    assert.isFalse(isBeforeContentEditableFalse(CaretPosition(getRoot(), 2)));
    assert.isFalse(isBeforeContentEditableFalse(CaretPosition(getRoot(), 3)));
  });

  it('TBA: isBeforeContentEditableFalse/isAfterContentEditableFalse on bogus all element', () => {
    setupHtml('<input><p contentEditable="false" data-mce-bogus="all"></p><input>');
    assert.isFalse(isBeforeContentEditableFalse(CaretPosition(getRoot(), 1)));
    assert.isFalse(isAfterContentEditableFalse(CaretPosition(getRoot(), 2)));
  });

  it('TBA: isAfterContentEditableFalse', () => {
    setupHtml(
      '<span contentEditable="false"></span>' +
      '<span contentEditable="false"></span>a'
    );

    assert.isFalse(isAfterContentEditableFalse(CaretPosition(getRoot(), 0)));
    assert.isTrue(isAfterContentEditableFalse(CaretPosition(getRoot(), 1)));
    assert.isTrue(isAfterContentEditableFalse(CaretPosition(getRoot(), 2)));
    assert.isFalse(isAfterContentEditableFalse(CaretPosition(getRoot(), 3)));
  });

  it('TBA: isEmptyText', () => {
    setupHtml('');
    getRoot().appendChild(document.createTextNode(''));
    assert.isTrue(isEmptyText(CaretPosition(getRoot().firstChild as Text, 0)));
    assert.isTrue(isEmptyText(CaretPosition(getRoot().firstChild as Text, 1)));

    setupHtml('<span data-mce-type="bookmark">' + ZWSP + '</span>');
    const span = getRoot().firstChild as HTMLSpanElement;
    assert.isFalse(isEmptyText(CaretPosition(span, 0)));
    assert.isFalse(isEmptyText(CaretPosition(span, 1)));
    assert.isTrue(isEmptyText(CaretPosition(span.firstChild as Text, 0)));
    assert.isTrue(isEmptyText(CaretPosition(span.firstChild as Text, 1)));
  });
});
