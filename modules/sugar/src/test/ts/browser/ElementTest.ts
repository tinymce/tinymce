import { Assert, UnitTest } from '@ephox/bedrock-client';

import { SugarElement } from 'ephox/sugar/api/node/SugarElement';

type ElementConstructor = typeof SugarElement.fromDom;

UnitTest.test('ElementTest', () => {
  const checkErr = <T extends Node | Window>(f: ElementConstructor, node: T | undefined | null) => {
    try {
      f(node as T);
    } catch (e) {
      // expected
      return;
    }
    Assert.fail('function did not throw an error');
  };

  const checkEl = <T extends Node | Window>(f: ElementConstructor, el: T, expt: T) => {
    const element = f(el);
    Assert.eq('', true, expt === element.dom);
  };

  checkErr(SugarElement.fromDom, undefined);
  checkErr(SugarElement.fromDom, null);
  checkEl(SugarElement.fromDom, document.body, document.body);
});
