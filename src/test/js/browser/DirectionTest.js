test(
  'DirectionTest',

  [
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.properties.Direction',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.test.EphoxElement'
  ],

  function (Attr, Body, Direction, Insert, Remove, EphoxElement) {
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
  }
);