asynctest(
  'TabstoppingTest',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Tabstopping',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.test.GuiSetup',
    'ephox.boulder.api.Objects'
  ],
 
  function (ApproxStructure, Assertions, GuiFactory, Behaviour, Tabstopping, Container, GuiSetup, Objects) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        Container.sketch({
          containerBehaviours: Behaviour.derive([
            Tabstopping.config({ })
          ])
        })
      );

    }, function (doc, body, gui, component, store) {
      return [
        Assertions.sAssertStructure(
          'Check initial tabstopping values',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('div', {
              attrs: {
                'data-alloy-tabstop': str.is('true')
              }
            });
          }),
          component.element()
        )
      ];
    }, function () { success(); }, failure);

  }
);