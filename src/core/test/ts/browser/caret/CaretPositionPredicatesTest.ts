import { LegacyUnit } from '@ephox/mcagar';
import { Pipeline } from '@ephox/agar';
import CaretPosition from 'tinymce/core/caret/CaretPosition';
import ViewBlock from '../../module/test/ViewBlock';
import { UnitTest } from '@ephox/bedrock-client';
import { isAfterContentEditableFalse, isBeforeContentEditableFalse } from 'tinymce/core/caret/CaretPositionPredicates';

UnitTest.asynctest('browser.tinymce.core.CaretPositiionPredicateTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();
  const viewBlock = ViewBlock();

  const getRoot = () => {
    return viewBlock.get();
  };

  const setupHtml = (html) => {
    viewBlock.update(html);
  };

  suite.test('isBeforeContentEditableFalse', () => {
    setupHtml(
      '<span contentEditable="false"></span>' +
      '<span contentEditable="false"></span>a'
    );

    LegacyUnit.strictEqual(isBeforeContentEditableFalse(CaretPosition(getRoot(), 0)), true);
    LegacyUnit.strictEqual(isBeforeContentEditableFalse(CaretPosition(getRoot(), 1)), true);
    LegacyUnit.strictEqual(isBeforeContentEditableFalse(CaretPosition(getRoot(), 2)), false);
    LegacyUnit.strictEqual(isBeforeContentEditableFalse(CaretPosition(getRoot(), 3)), false);
  });

  suite.test('isBeforeContentEditableFalse/isAfterContentEditableFalse on bogus all element', () => {
    setupHtml('<input><p contentEditable="false" data-mce-bogus="all"></p><input>');
    LegacyUnit.strictEqual(isBeforeContentEditableFalse(CaretPosition(getRoot(), 1)), false);
    LegacyUnit.strictEqual(isAfterContentEditableFalse(CaretPosition(getRoot(), 2)), false);
  });

  suite.test('isAfterContentEditableFalse', () => {
    setupHtml(
      '<span contentEditable="false"></span>' +
      '<span contentEditable="false"></span>a'
    );

    LegacyUnit.strictEqual(isAfterContentEditableFalse(CaretPosition(getRoot(), 0)), false);
    LegacyUnit.strictEqual(isAfterContentEditableFalse(CaretPosition(getRoot(), 1)), true);
    LegacyUnit.strictEqual(isAfterContentEditableFalse(CaretPosition(getRoot(), 2)), true);
    LegacyUnit.strictEqual(isAfterContentEditableFalse(CaretPosition(getRoot(), 3)), false);
  });

  viewBlock.attach();
  Pipeline.async({}, suite.toSteps({}), () => {
    viewBlock.detach();
    success();
  }, failure);
});
