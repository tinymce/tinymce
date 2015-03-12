define(
  'ephox.echo.api.AriaState',

  [
    'ephox.compass.Arr',
    'ephox.sugar.api.Attr'
  ],

  function (Arr, Attr) {
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

    var tabSelected = function (on, offs) {
      Attr.setAll(on, {
        'aria-selected': 'true',    // JAWS
        'aria-pressed': 'true'      // VoiceOver
      });

      Arr.each(offs, function (off) {
        Attr.setAll(off, {
          'aria-selected': 'false', // JAWS
          'aria-pressed': 'false'   // VoiceOver
        });
      });
    };

    return {
      expanded: expanded,
      collapsed: collapsed,
      pressed: pressed,
      enable: enable,
      disable: disable,
      tabSelected: tabSelected
    };
  }
);