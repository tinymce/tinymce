define(
  'ephox.echo.test.Button',

  [
    'ephox.peanut.Fun',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert'
  ],

  function (Fun, Class, Element, Insert) {
    var toggle = function () {
      var container = Element.fromTag('span');
      var button = Element.fromTag('button');
      Insert.append(container, button);
      var selected = Class.toggler(container, 'test-statebutton-selected');
      return {
        element: Fun.constant(container),
        select: selected.on,
        deselect: selected.off,
        selected: selected.isOn
      };
    };

    return {
      toggle: toggle
    };
  }
);