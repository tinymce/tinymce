import Element from 'ephox/sugar/api/node/Element';
import Select from 'ephox/sugar/api/tag/SelectTag';
import { UnitTest } from '@ephox/bedrock-client';
import { HTMLSelectElement } from '@ephox/dom-globals';
import { KAssert } from '@ephox/katamari-assertions';

UnitTest.test('SelectTagTest', () => {
  const select = Element.fromHtml<HTMLSelectElement>('<select><option selected="selected" value="myvalue">valx</option><option value="non selected">valy</option></select>');
  const selectVal = Select.getValue(select);
  KAssert.eqSome('eq', 'myvalue', selectVal);

  const emptySelect = Element.fromHtml<HTMLSelectElement>('<select></select>');
  const emptySelectVal = Select.getValue(emptySelect);
  KAssert.eqNone('eq', emptySelectVal);
});
