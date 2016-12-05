asynctest(
  'RepresentingTest',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.test.GuiSetup',
    'ephox.sugar.api.Value'
  ],
 
  function (ApproxStructure, Assertions, FocusTools, Step, GuiFactory, Representing, GuiSetup, Value) {
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
            initialValue: {
              value: 'dog',
              text: 'Dog'
            },
            onSet: function (input, value) {
              Value.set(input.element(), value.text);
            },
            interactive: {
              event: 'input',
              process: function (input) {
                var v = Value.get(input.element());
                return {
                  value: v.toLowerCase(),
                  text: v
                };
              }
            }
          }
        }
      });

    }, function (doc, body, gui, component, store) {
      var sAssertValue = function (label, expected) {
        return Step.sync(function () {
          var v = Representing.getValue(component);
          Assertions.assertEq(label, expected, v);
        });
      };

      return [
        Assertions.sAssertStructure(
          'Initial value should be "dog"',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('input', {
              value: str.is('Dog')
            });
          }),
          component.element()
        ),

        sAssertValue('Checking represented value on load', { value: 'dog', text: 'Dog' }),

        FocusTools.sSetFocus('Setting of focus on input field', gui.element(), 'input'),
        FocusTools.sSetActiveValue(doc, 'Cat'),
        // Note, Value.set does not actually dispatch the event, so we have to simulate it.
        Step.sync(function () {
          component.getSystem().triggerEvent('input', component.element(), { });
        }),
        // Because sSetActiveValue does not fir

        sAssertValue('Checking represented value after change', { value: 'cat', text: 'Cat' }),

        Step.sync(function () {
          Representing.setValue(component, {
            value: 'elephant',
            text: 'Elephant'
          });
        }),

        sAssertValue('Checking represented value after setValue', { value: 'elephant', text: 'Elephant' }),
        Assertions.sAssertStructure(
          'Value should be "Elephant"',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('input', {
              value: str.is('Elephant')
            });
          }),
          component.element()
        )
      ];
    }, function () { success(); }, failure);

  }
);