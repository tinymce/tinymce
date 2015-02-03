test(
  'AriaStateTest',

  [
    'ephox.echo.api.AriaState',
    'ephox.echo.test.Button',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!assert'
  ],

  function (AriaState, Button, Fun, Attr, Class, Element, Insert, assert) {
    var element = function() {
      return Element.fromTag('div');
    };

    var test = function (method, element, attribute, expected) {
      method(element);
      assert.eq(Attr.get(element, attribute), expected);
    };

    test(AriaState.expanded, element(), 'aria-expanded', 'true');
    test(AriaState.collapsed, element(), 'aria-expanded', 'false');
    test(AriaState.enable, element(), 'aria-disabled', 'false');
    test(AriaState.disable, element(), 'aria-disabled', 'true');

    var button = Button.toggle();

    // Test our scaffolding toggle button
    assert.eq(button.selected(), false);
    button.select();
    assert.eq(button.selected(), true);
    button.deselect();
    assert.eq(button.selected(), false);

    var testButton = function (method, button, attribute, expected) {
      method(button);
      assert.eq(Attr.get(button.element(), attribute), expected);
    };

    testButton(AriaState.pressed, button, 'aria-pressed', 'false');
    button.select();
    testButton(AriaState.pressed, button, 'aria-pressed', 'true');
    button.deselect();
    testButton(AriaState.pressed, button, 'aria-pressed', 'false');
  }
);