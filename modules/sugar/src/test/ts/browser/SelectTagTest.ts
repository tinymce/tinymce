import Element from 'ephox/sugar/api/node/Element';
import Select from 'ephox/sugar/api/tag/SelectTag';
import { UnitTest, assert } from '@ephox/bedrock';
import { HTMLSelectElement } from '@ephox/dom-globals';

UnitTest.test('SelectTagTest', function () {
  const checkSome = function (opt, expected) {
    opt.fold(function () {
      assert.fail('Expected to be a some value: ' + expected);
    }, function (v) {
      assert.eq(true, v === expected);
    });
  };

  const select = Element.fromHtml<HTMLSelectElement>('<select><option selected="selected" value="myvalue">valx</option><option value="non selected">valy</option></select>');
  const selectVal = Select.getValue(select);
  checkSome(selectVal, 'myvalue');

  const emptySelect = Element.fromHtml<HTMLSelectElement>('<select></select>');
  const emptySelectVal = Select.getValue(emptySelect);
  assert.eq(true, emptySelectVal.isNone());
});
