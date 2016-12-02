asynctest(
  'UnselectingTest',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (ApproxStructure, Assertions, Keyboard, Keys, Step, GuiFactory, EventHandler, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build({
        uiType: 'container',
        behaviours: {
          unselecting: { }
        }
      });

    }, function (doc, body, gui, component, store) {
      return [
        Assertions.sAssertStructure(
          'Check initial unselecting values',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('div', {
              styles: {
                /* Browser dependent 
                '-webkit-user-select': str.is('none'),
                'user-select': str.is('none'),
                '-ms-user-select': str.is('none'),
                '-moz-user-select': str.is('-moz-none')
                */
              },
              attrs: {
                unselectable: str.is('on')
              }
            });
          }),
          component.element()
        )
      ];
    }, function () { success(); }, failure);

  }
);