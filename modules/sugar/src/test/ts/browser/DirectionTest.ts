import * as Attr from 'ephox/sugar/api/properties/Attr';
import * as Body from 'ephox/sugar/api/node/Body';
import * as Direction from 'ephox/sugar/api/properties/Direction';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import EphoxElement from 'ephox/sugar/test/EphoxElement';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('DirectionTest', function () {
  const el = EphoxElement('div');
  const body = Body.body();

  const appendToDom = function (element) {
    Insert.append(body, element);
  };

  const assertDirection = function (element, expectedDirection) {
    appendToDom(element);
    const dir = Direction.getDirection(element);
    assert.eq(expectedDirection, dir);
    Remove.remove(element);
  };

  const assertOnDirection = function (element, isLeftReturnThis, isRightReturnThis, expectedOn) {
    appendToDom(element);
    const onDirection = Direction.onDirection(isLeftReturnThis, isRightReturnThis);
    assert.eq(expectedOn, onDirection(element));
    Remove.remove(element);
  };

  const direction = Direction.getDirection(el);
  assertDirection(el, 'ltr');
  assertOnDirection(el, 'isLeft', 'isRight', 'isLeft');

  const arabicElement = EphoxElement('div');
  Attr.setAll(arabicElement, {lang: 'ar', dir: 'rtl'});
  assertDirection(arabicElement, 'rtl');
  assertOnDirection(arabicElement, 'isLeft', 'isRight', 'isRight');
});
