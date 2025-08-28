import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';

import * as Compare from 'ephox/sugar/api/dom/Compare';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as SugarBody from 'ephox/sugar/api/node/SugarBody';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as Css from 'ephox/sugar/api/properties/Css';
import Div from 'ephox/sugar/test/Div';

UnitTest.test('ElementFromPointTest', () => {
  const a = Div();
  const bg = Div();

  const placeElm = (elm: SugarElement<Node>, x: number, y: number, w: number, h: number) => {
    Css.setAll(elm, {
      position: 'fixed',
      left: x + 'px',
      top: y + 'px',
      width: w + 'px',
      height: h + 'px',
      background: 'red'
    });
  };

  const getAt = (elm: SugarElement<Node>, placeX: number, placeY: number, testX: number, testY: number) => {
    placeElm(elm, placeX, placeY, 100, 50);
    return SugarElement.fromPoint(SugarElement.fromDom(document), testX, testY);
  };

  const checkMatch = (p: SugarElement<Node>, placeX: number, placeY: number, expectedElm: SugarElement<Node>, testX: number, testY: number) => {
    const actualElm = getAt(p, placeX, placeY, testX, testY).getOrDie('Should be some element.');
    // debugger
    Assert.eq('Should be expected element', true, Compare.eq(expectedElm, actualElm));
  };

  const checkNone = (p: SugarElement<Node>, placeX: number, placeY: number, testX: number, testY: number) => {
    KAssert.eqNone('Should be none', getAt(p, placeX, placeY, testX, testY));
  };

  Arr.each([ bg, a ], (elm) => {
    Insert.append(SugarBody.body(), elm);
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
