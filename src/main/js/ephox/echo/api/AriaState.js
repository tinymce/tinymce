define(
  'ephox.echo.api.AriaState',

  [
    'ephox.compass.Arr',
    'ephox.sugar.api.Attr',
    'global!String'
  ],

  function (Arr, Attr, String) {
    var expanded = function (element) {
      Attr.set(element, 'aria-expanded', 'true');
    };

    var collapsed = function (element) {
      Attr.set(element, 'aria-expanded', 'false');
    };

    var checked = function (element, state) {
      Attr.set(element, 'aria-checked', String(state));
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

    var showPanel = function (element) {
      Attr.set(element, 'aria-selected', 'true');
      Attr.set(element, 'aria-hidden', 'false');
    };

    var hidePanel = function (element) {
      Attr.set(element, 'aria-selected', 'false');
      Attr.set(element, 'aria-hidden', 'true');
    };

    var updateLabel = function (element, newLabel) {
      Attr.set(element, 'aria-label', newLabel);
    };

    return {
      expanded: expanded,
      collapsed: collapsed,
      checked: checked,
      pressed: pressed,
      enable: enable,
      disable: disable,
      tabSelected: tabSelected,
      showPanel: showPanel,
      hidePanel: hidePanel,
      updateLabel: updateLabel
    };
  }
);