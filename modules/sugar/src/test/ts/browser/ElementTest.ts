import Element from 'ephox/sugar/api/node/Element';
import { UnitTest, assert } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';

UnitTest.test('ElementTest', function () {
  const checkErr = function (f, val) {
    try {
      f(val);
    } catch (e) {
      // expected
      return;
    }
    assert.fail('function did not throw an error');
  };

  const checkEl = function (f, el, expt) {
    const element = f(el);
    assert.eq(true, expt === element.dom());
  };

  checkErr(Element.fromDom, undefined);
  checkErr(Element.fromDom, null);
  checkEl(Element.fromDom, document.body, document.body);
});
