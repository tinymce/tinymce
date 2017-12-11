import Css from 'ephox/sugar/api/properties/Css';
import CssProperty from 'ephox/sugar/api/properties/CssProperty';
import EphoxElement from 'ephox/sugar/test/EphoxElement';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('CssProperty', function() {
  var propertyName = 'text-align';
  var propertyValue = 'center';
  var init = CssProperty(propertyName, propertyValue);
  var el = EphoxElement('div');

  var propertyIsNot = function (elm, propName, propValue) {
    assert.eq(false, init.is(elm));
    assert.eq(false, Css.get(elm, propName) === propValue, 'Expected ' + elm.dom() + ' to don\'t have property '+ propName +' set to ' + propValue);
  };

  var propertyIs = function (elm, propName, propValue) {
    assert.eq(true, init.is(elm), 'This is failing because ' + elm.dom() + ' should have ' + propName + ':' + propValue + '. But found: ' + Css.get(elm, propName) );
    assert.eq(true, Css.get(elm, propName) === propValue, 'Expected ' + elm.dom() + ' to have property '+ propName +' set to ' + propValue);
  };

  propertyIsNot(el, propertyName, propertyValue);
  init.set(el);
  propertyIs(el, propertyName, propertyValue);
  init.remove(el);
  propertyIsNot(el, propertyName, propertyValue);
});

