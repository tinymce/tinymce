import { assert, UnitTest } from '@ephox/bedrock-client';
import { document, Node as DomNode, Window } from '@ephox/dom-globals';
import Element from 'ephox/sugar/api/node/Element';

type ElementConstructor<T extends DomNode | Window> = typeof Element.fromDom;

UnitTest.test('ElementTest', () => {
  const checkErr = <T extends DomNode | Window>(f: ElementConstructor<T>, node: T | undefined | null) => {
    try {
      f(node as T);
    } catch (e) {
      // expected
      return;
    }
    assert.fail('function did not throw an error');
  };

  const checkEl = <T extends DomNode | Window>(f: ElementConstructor<T>, el: T, expt: T) => {
    const element = f(el);
    assert.eq(true, expt === element.dom());
  };

  checkErr(Element.fromDom, undefined);
  checkErr(Element.fromDom, null);
  checkEl(Element.fromDom, document.body, document.body);
});
