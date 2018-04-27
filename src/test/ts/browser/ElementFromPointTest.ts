import { Arr } from '@ephox/katamari';
import Compare from 'ephox/sugar/api/dom/Compare';
import Insert from 'ephox/sugar/api/dom/Insert';
import Remove from 'ephox/sugar/api/dom/Remove';
import Body from 'ephox/sugar/api/node/Body';
import Css from 'ephox/sugar/api/properties/Css';
import Element from 'ephox/sugar/api/node/Element';
import Div from 'ephox/sugar/test/Div';
import { UnitTest, assert } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';

UnitTest.test('ElementFromPointTest', function() {
  var a = Div();
  var bg = Div();

  var placeElm = function (elm, x, y, w, h) {
    Css.setAll(elm, {
      position: 'fixed',
      left: x + 'px',
      top: y + 'px',
      width: w + 'px',
      height: h + 'px',
      background: 'red'
    });
  };

  var getAt = function (elm, placeX, placeY, testX, testY) {
    placeElm(elm, placeX, placeY, 100, 50);
    return Element.fromPoint(Element.fromDom(document), testX, testY);
  };

  var checkMatch = function (placeElm, placeX, placeY, expectedElm, testX, testY) {
    var actualElm = getAt(placeElm, placeX, placeY, testX, testY).getOrDie('Should be some element.');
    //debugger
    assert.eq(true, Compare.eq(expectedElm, actualElm), 'Should be expected element');
  };

  var checkNone = function (placeElm, placeX, placeY, testX, testY) {
    assert.eq(true, getAt(placeElm, placeX, placeY, testX, testY).isNone(), 'Should be none');
  };

  Arr.each([bg, a], function (elm) {
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

  Arr.each([bg, a], Remove.remove);
});

