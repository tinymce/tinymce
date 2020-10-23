import { Log, Pipeline, Step } from '@ephox/agar';
import { assert, UnitTest } from '@ephox/bedrock-client';
import CaretPosition from 'tinymce/core/caret/CaretPosition';
import { isAfterContentEditableFalse, isBeforeContentEditableFalse, isEmptyText } from 'tinymce/core/caret/CaretPositionPredicates';
import { ZWSP } from 'tinymce/core/text/Zwsp';
import ViewBlock from '../../module/test/ViewBlock';

UnitTest.asynctest('browser.tinymce.core.CaretPositionPredicateTest', (success, failure) => {
  const viewBlock = ViewBlock();

  const getRoot = () => viewBlock.get();

  const setupHtml = (html: string) => viewBlock.update(html);

  viewBlock.attach();
  Pipeline.async({}, [
    Log.step('TBA', 'isBeforeContentEditableFalse', Step.sync(() => {
      setupHtml(
        '<span contentEditable="false"></span>' +
        '<span contentEditable="false"></span>a'
      );

      assert.eq(isBeforeContentEditableFalse(CaretPosition(getRoot(), 0)), true);
      assert.eq(isBeforeContentEditableFalse(CaretPosition(getRoot(), 1)), true);
      assert.eq(isBeforeContentEditableFalse(CaretPosition(getRoot(), 2)), false);
      assert.eq(isBeforeContentEditableFalse(CaretPosition(getRoot(), 3)), false);
    })),

    Log.step('TBA', 'isBeforeContentEditableFalse/isAfterContentEditableFalse on bogus all element', Step.sync(() => {
      setupHtml('<input><p contentEditable="false" data-mce-bogus="all"></p><input>');
      assert.eq(isBeforeContentEditableFalse(CaretPosition(getRoot(), 1)), false);
      assert.eq(isAfterContentEditableFalse(CaretPosition(getRoot(), 2)), false);
    })),

    Log.step('TBA', 'isAfterContentEditableFalse', Step.sync(() => {
      setupHtml(
        '<span contentEditable="false"></span>' +
        '<span contentEditable="false"></span>a'
      );

      assert.eq(isAfterContentEditableFalse(CaretPosition(getRoot(), 0)), false);
      assert.eq(isAfterContentEditableFalse(CaretPosition(getRoot(), 1)), true);
      assert.eq(isAfterContentEditableFalse(CaretPosition(getRoot(), 2)), true);
      assert.eq(isAfterContentEditableFalse(CaretPosition(getRoot(), 3)), false);
    })),

    Log.step('TBA', 'isEmptyText', Step.sync(() => {
      setupHtml('');
      getRoot().appendChild(document.createTextNode(''));
      assert.eq(isEmptyText(CaretPosition(getRoot().firstChild, 0)), true);
      assert.eq(isEmptyText(CaretPosition(getRoot().firstChild, 1)), true);

      setupHtml('<span data-mce-type="bookmark">' + ZWSP + '</span>');
      const span = getRoot().firstChild;
      assert.eq(isEmptyText(CaretPosition(span, 0)), false);
      assert.eq(isEmptyText(CaretPosition(span, 1)), false);
      assert.eq(isEmptyText(CaretPosition(span.firstChild, 0)), true);
      assert.eq(isEmptyText(CaretPosition(span.firstChild, 1)), true);
    }))
  ], () => {
    viewBlock.detach();
    success();
  }, failure);
});
