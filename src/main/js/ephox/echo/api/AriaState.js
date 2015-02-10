define(
  'ephox.echo.api.AriaState',

  [
    'ephox.sugar.api.Attr'
  ],

  function (Attr) {
    var expanded = function (element) {
      Attr.set(element, 'aria-expanded', 'true');
    };

    var collapsed = function (element) {
      Attr.set(element, 'aria-expanded', 'false');
    };

    var pressed = function (button) {
      var state = button.selected() ? 'true' : 'false';
      Attr.set(button.element(), 'aria-pressed', state);
    };

    var enable = function (element) {
      Attr.set(element, 'aria-disabled', 'false');
    };

    var disable = function (element) {
      Attr.set(element, 'aria-disabled', 'true');
    };

    return {
      expanded: expanded,
      collapsed: collapsed,
      pressed: pressed,
      enable: enable,
      disable: disable
    };
  }
);