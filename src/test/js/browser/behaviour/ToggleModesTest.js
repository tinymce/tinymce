test(
  'Browser Test: behaviour.ToggleModesTest',

  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.behaviour.toggling.ToggleModes'
  ],

  function (ApproxStructure, Assertions, GuiFactory, ToggleModes) {
    var button = GuiFactory.build({
      dom: {
        tag: 'button'
      }
    });
    ToggleModes.updateAuto(button, { }, true);

    Assertions.assertStructure(
      'Button should have aria-pressed role',
      ApproxStructure.build(function (s, str, arr) {
        return s.element('button', {
          attrs: {
            'aria-checked': str.none(),
            'aria-pressed': str.is('true')
          }
        });
      }),
      button.element()
    );
  }
);
