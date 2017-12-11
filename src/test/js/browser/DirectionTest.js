import Attr from 'ephox/sugar/api/properties/Attr';
import Body from 'ephox/sugar/api/node/Body';
import Direction from 'ephox/sugar/api/properties/Direction';
import Insert from 'ephox/sugar/api/dom/Insert';
import Remove from 'ephox/sugar/api/dom/Remove';
import EphoxElement from 'ephox/sugar/test/EphoxElement';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('DirectionTest', function() {
  var el = EphoxElement('div');
  var body = Body.body();

  var appendToDom = function (element) {
    Insert.append(body, element);
  };

  var assertDirection = function (element, expectedDirection) {
    appendToDom(element);
    var direction = Direction.getDirection(element);
    assert.eq(expectedDirection, direction);
    Remove.remove(element);
  };

  var assertOnDirection = function (element, isLeftReturnThis, isRightReturnThis, expectedOn) {
    appendToDom(element);
    var onDirection = Direction.onDirection(isLeftReturnThis, isRightReturnThis);
    assert.eq(expectedOn, onDirection(element));
    Remove.remove(element);
  };

  var direction = Direction.getDirection(el);
  assertDirection(el, 'ltr');
  assertOnDirection(el, 'isLeft', 'isRight', 'isLeft');

  var arabicElement = EphoxElement('div');
  Attr.setAll(arabicElement, {lang: 'ar', dir: 'rtl'});
  assertDirection(arabicElement, 'rtl');
  assertOnDirection(arabicElement, 'isLeft', 'isRight', 'isRight');
});

