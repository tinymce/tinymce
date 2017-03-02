/* jshint es3: false, esversion: 6 */
domtest(
  'ToggleModesTest',

  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.RawAssertions',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.behaviour.toggling.ToggleModes',
    'global!Promise'
  ],

  function (ApproxStructure, Assertions, RawAssertions, GuiFactory, ToggleModes, Promise) {
    /*
     * This is not working yet because wrap-sizzle is using an incompatible with jsdom
     * means of getting the global exports
     */
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
            'aria-checked': str.is('true'),
            'aria-pressed': str.none()
          }
        });
      }),
      button.element()
    );
  
    RawAssertions.assertEq('hi', 1, 2);
    return Promise.resolve();
  }
);