asynctest(
  'RepresentingTest',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.test.GuiSetup',
    'ephox.sugar.api.Value'
  ],
 
  function (ApproxStructure, Assertions, Keyboard, Keys, Step, GuiFactory, EventHandler, GuiSetup, Value) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'input'
        },
        behaviours: {
          representing: {
            initialValue: 'dog',
            onSet: function (input, value) {
              Value.set(input, value);
            },
            // on Change.
          }
        }
      });

    }, function (doc, body, gui, component, store) {
      return [
        Assertions.sAssertStructure(
          'Initial value should be "dog"',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('input', {
              value: str.is('dog')
            });
          }),
          component.element()
        ),
        Step.fail('Debugging')
      ];
    }, function () { success(); }, failure);

  }
);