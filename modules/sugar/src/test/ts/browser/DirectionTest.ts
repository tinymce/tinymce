import { assert, UnitTest } from '@ephox/bedrock-client';
import { Element as DomElement } from '@ephox/dom-globals';
import { Element } from '@ephox/sugar';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as Body from 'ephox/sugar/api/node/Body';
import * as Attr from 'ephox/sugar/api/properties/Attr';
import * as Direction from 'ephox/sugar/api/properties/Direction';
import EphoxElement from 'ephox/sugar/test/EphoxElement';

UnitTest.test('DirectionTest', () => {
  const el = EphoxElement('div');
  const body = Body.body();

  const appendToDom = (element: Element<DomElement>) => {
    Insert.append(body, element);
  };

  const assertDirection = (element: Element<DomElement>, expectedDirection: 'ltr' | 'rtl') => {
    appendToDom(element);
    const dir = Direction.getDirection(element);
    assert.eq(expectedDirection, dir);
    Remove.remove(element);
  };

  const assertOnDirection = (element: Element<DomElement>, isLeftReturnThis: string, isRightReturnThis: string, expectedOn: string) => {
    appendToDom(element);
    const onDirection = Direction.onDirection(isLeftReturnThis, isRightReturnThis);
    assert.eq(expectedOn, onDirection(element));
    Remove.remove(element);
  };

  assertDirection(el, 'ltr');
  assertOnDirection(el, 'isLeft', 'isRight', 'isLeft');

  const arabicElement = EphoxElement('div');
  Attr.setAll(arabicElement, { lang: 'ar', dir: 'rtl' });
  assertDirection(arabicElement, 'rtl');
  assertOnDirection(arabicElement, 'isLeft', 'isRight', 'isRight');
});
