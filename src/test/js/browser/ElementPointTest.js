test(
  'ElementPointTest',

  [
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.view.ElementFromPoint',
    'ephox.sugar.test.Div'
  ],

  function (Arr, Compare, Insert, Remove, Body, Css, ElementFromPoint, Div) {
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
      return ElementFromPoint.elementFromPoint(window, testX, testY);
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
  }
);