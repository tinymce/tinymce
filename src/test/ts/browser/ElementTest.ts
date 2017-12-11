import Element from 'ephox/sugar/api/node/Element';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('ElementTest', function() {
  var checkErr = function (f, val) {
    try {
      f(val);
    } catch (e) {
      // expected
      return;
    }
    assert.fail('function did not throw an error');
  };

  var checkEl = function (f, el, expt) {
    var element = f(el);
    assert.eq(true, expt === element.dom());
  };

  checkErr(Element.fromDom, undefined);
  checkErr(Element.fromDom, null);
  checkEl(Element.fromDom, document.body, document.body);
});

