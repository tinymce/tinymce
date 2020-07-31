import { assert, UnitTest } from '@ephox/bedrock-client';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';

type ElementConstructor<T extends Node | Window> = typeof SugarElement.fromDom;

UnitTest.test('ElementTest', () => {
  const checkErr = <T extends Node | Window>(f: ElementConstructor<T>, node: T | undefined | null) => {
    try {
      f(node as T);
    } catch (e) {
      // expected
      return;
    }
    assert.fail('function did not throw an error');
  };

  const checkEl = <T extends Node | Window>(f: ElementConstructor<T>, el: T, expt: T) => {
    const element = f(el);
    assert.eq(true, expt === element.dom);
  };

  checkErr(SugarElement.fromDom, undefined);
  checkErr(SugarElement.fromDom, null);
  checkEl(SugarElement.fromDom, document.body, document.body);
});
