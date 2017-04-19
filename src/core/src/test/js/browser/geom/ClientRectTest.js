asynctest(
  'browser.tinymce.core.geom.ClientRectTest',
  [
    'ephox.mcagar.api.LegacyUnit',
    'ephox.agar.api.Pipeline',
    'tinymce.core.geom.ClientRect'
  ],
  function (LegacyUnit, Pipeline, ClientRect) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    var rect = function (x, y, w, h) {
      return {
        left: x,
        top: y,
        bottom: y + h,
        right: x + w,
        width: w,
        height: h
      };
    };

    suite.test('clone', function () {
      LegacyUnit.deepEqual(ClientRect.clone(rect(10, 20, 30, 40)), rect(10, 20, 30, 40));
      LegacyUnit.deepEqual(ClientRect.clone(rect(10.1, 20.1, 30.1, 40.1)), rect(10, 20, 30, 40));
    });

    suite.test('collapse', function () {
      LegacyUnit.deepEqual(ClientRect.collapse(rect(10, 20, 30, 40), true), rect(10, 20, 0, 40));
      LegacyUnit.deepEqual(ClientRect.collapse(rect(10, 20, 30, 40), false), rect(40, 20, 0, 40));
    });

    suite.test('isAbove', function () {
      LegacyUnit.equal(ClientRect.isAbove(rect(10, 70, 10, 40), rect(20, 40, 10, 20)), false);
      LegacyUnit.equal(ClientRect.isAbove(rect(10, 40, 10, 20), rect(20, 70, 10, 40)), true);
    });

    suite.test('isAbove intersects', function () {
      LegacyUnit.equal(ClientRect.isAbove(rect(10, 20, 10, 10), rect(20, 20, 10, 10)), false);
      LegacyUnit.equal(ClientRect.isAbove(rect(10, 20, 10, 40), rect(20, 20, 10, 10)), false);
      LegacyUnit.equal(ClientRect.isAbove(rect(10, 20, 10, 10), rect(20, 20, 10, 40)), false);
      LegacyUnit.equal(ClientRect.isAbove(rect(10, 10, 10, 10), rect(20, 15, 10, 10)), false);
      LegacyUnit.equal(ClientRect.isAbove(rect(10, 15, 10, 10), rect(20, 20, 10, 10)), false);
      LegacyUnit.equal(ClientRect.isAbove(rect(10, 10, 10, 10), rect(20, 20, 10, 10)), true);
      LegacyUnit.equal(ClientRect.isAbove(rect(10, 10, 10, 10), rect(20, 16, 10, 10)), true);
    });

    suite.test('isBelow', function () {
      LegacyUnit.equal(ClientRect.isBelow(rect(10, 70, 10, 40), rect(20, 40, 10, 20)), true);
      LegacyUnit.equal(ClientRect.isBelow(rect(10, 40, 10, 20), rect(20, 70, 10, 40)), false);
    });

    suite.test('isBelow intersects', function () {
      LegacyUnit.equal(ClientRect.isBelow(rect(10, 30, 10, 20), rect(20, 10, 10, 20)), true);
      LegacyUnit.equal(ClientRect.isBelow(rect(10, 30, 10, 20), rect(20, 10, 10, 25)), true);
      LegacyUnit.equal(ClientRect.isBelow(rect(10, 15, 10, 20), rect(20, 30, 10, 20)), false);
      LegacyUnit.equal(ClientRect.isBelow(rect(10, 29, 10, 20), rect(20, 10, 10, 30)), false);
      LegacyUnit.equal(ClientRect.isBelow(rect(10, 30, 10, 20), rect(20, 10, 10, 30)), true);
      LegacyUnit.equal(ClientRect.isBelow(rect(10, 20, 10, 20), rect(20, 10, 10, 30)), false);
    });

    suite.test('isLeft', function () {
      LegacyUnit.equal(ClientRect.isLeft(rect(10, 20, 30, 40), rect(20, 20, 30, 40)), true);
      LegacyUnit.equal(ClientRect.isLeft(rect(20, 20, 30, 40), rect(10, 20, 30, 40)), false);
    });

    suite.test('isRight', function () {
      LegacyUnit.equal(ClientRect.isRight(rect(10, 20, 30, 40), rect(20, 20, 30, 40)), false);
      LegacyUnit.equal(ClientRect.isRight(rect(20, 20, 30, 40), rect(10, 20, 30, 40)), true);
    });

    suite.test('compare', function () {
      LegacyUnit.equal(ClientRect.compare(rect(10, 70, 10, 40), rect(10, 40, 10, 20)), 1);
      LegacyUnit.equal(ClientRect.compare(rect(10, 40, 10, 20), rect(10, 70, 10, 40)), -1);
      LegacyUnit.equal(ClientRect.compare(rect(5, 10, 10, 10), rect(10, 10, 10, 10)), -1);
      LegacyUnit.equal(ClientRect.compare(rect(15, 10, 10, 10), rect(10, 10, 10, 10)), 1);
    });

    suite.test('containsXY', function () {
      LegacyUnit.equal(ClientRect.containsXY(rect(10, 70, 10, 40), 1, 2), false);
      LegacyUnit.equal(ClientRect.containsXY(rect(10, 70, 10, 40), 15, 2), false);
      LegacyUnit.equal(ClientRect.containsXY(rect(10, 70, 10, 40), 25, 2), false);
      LegacyUnit.equal(ClientRect.containsXY(rect(10, 70, 10, 40), 10, 70), true);
      LegacyUnit.equal(ClientRect.containsXY(rect(10, 70, 10, 40), 20, 110), true);
      LegacyUnit.equal(ClientRect.containsXY(rect(10, 70, 10, 40), 15, 75), true);
    });

    Pipeline.async({}, suite.toSteps({}), function () {
      success();
    }, failure);
  }
);
