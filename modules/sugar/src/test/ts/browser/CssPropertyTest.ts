import { assert, UnitTest } from '@ephox/bedrock-client';

import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as Css from 'ephox/sugar/api/properties/Css';
import { CssProperty } from 'ephox/sugar/api/properties/CssProperty';
import EphoxElement from 'ephox/sugar/test/EphoxElement';

UnitTest.test('CssProperty', () => {
  const propertyName = 'text-align';
  const propertyValue = 'center';
  const init = CssProperty(propertyName, propertyValue);
  const el = EphoxElement('div');

  const propertyIsNot = (elm: SugarElement<Element>, propName: string, propValue: string) => {
    assert.eq(false, init.is(elm));
    assert.eq(false, Css.get(elm, propName) === propValue, 'Expected ' + elm.dom + ' to not have property ' + propName + ' set to ' + propValue);
  };

  const propertyIs = (elm: SugarElement<Element>, propName: string, propValue: string) => {
    assert.eq(true, init.is(elm), 'This is failing because ' + elm.dom + ' should have ' + propName + ':' + propValue + '. But found: ' + Css.get(elm, propName) );
    assert.eq(true, Css.get(elm, propName) === propValue, 'Expected ' + elm.dom + ' to have property ' + propName + ' set to ' + propValue);
  };

  propertyIsNot(el, propertyName, propertyValue);
  init.set(el);
  propertyIs(el, propertyName, propertyValue);
  init.remove(el);
  propertyIsNot(el, propertyName, propertyValue);
});
