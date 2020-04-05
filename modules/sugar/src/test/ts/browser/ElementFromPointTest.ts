import { Assert, UnitTest } from '@ephox/bedrock-client';
import { document, Node as DomNode } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';
import * as Compare from 'ephox/sugar/api/dom/Compare';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import * as Css from 'ephox/sugar/api/properties/Css';
import Div from 'ephox/sugar/test/Div';

UnitTest.test('ElementFromPointTest', () => {
  const a = Div();
  const bg = Div();

  const placeElm = (elm: Element<DomNode>, x: number, y: number, w: number, h: number) => {
    Css.setAll(elm, {
      position: 'fixed',
      left: x + 'px',
      top: y + 'px',
      width: w + 'px',
      height: h + 'px',
      background: 'red'
    });
  };

  const getAt = (elm: Element, placeX: number, placeY: number, testX: number, testY: number) => {
    placeElm(elm, placeX, placeY, 100, 50);
    return Element.fromPoint(Element.fromDom(document), testX, testY);
  };

  const checkMatch = (p: Element<DomNode>, placeX: number, placeY: number, expectedElm: Element<DomNode>, testX: number, testY: number) => {
    const actualElm = getAt(p, placeX, placeY, testX, testY).getOrDie('Should be some element.');
    // debugger
    Assert.eq('Should be expected element', true, Compare.eq(expectedElm, actualElm));
  };

  const checkNone = (p: Element<DomNode>, placeX: number, placeY: number, testX: number, testY: number) => {
    KAssert.eqNone('Should be none', getAt(p, placeX, placeY, testX, testY));
  };

  Arr.each([ bg, a ], (elm) => {
    Insert.append(Body.body(), elm);
  });

  placeElm(bg, 0, 0, 200, 200);

  checkMatch(a, 10, 10, a, 20, 20);
  checkMatch(a, 10, 10, a, 20, 59);
  checkMatch(a, 10, 10, a, 109, 59);
  checkMatch(a, 10, 10, bg, 110, 60);
  checkMatch(a, 10, 20, bg, 10, 10);
  checkMatch(a, 20, 10, bg, 10, 10);
  checkMatch(a, 20, 20, bg, 10, 10);
  checkNone(a, 0, 0, -1000, -1000);

  Arr.each([ bg, a ], Remove.remove);
});
