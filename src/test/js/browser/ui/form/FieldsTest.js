asynctest(
  'Fields Ui',
 
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.ui.FormInput',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (Assertions, Step, GuiFactory, Representing, FormInput, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {

      var inputA = FormInput.build({
        uid: 'input-a',
        dom: {
          tag: 'div'
        },
        components: [
          FormInput.parts().field(),
          FormInput.parts().label()
        ],
        parts: {
          field: {
            data: {
              value: 'init',
              text: 'Init'
            }
          },
          label: {
            dom: {
              tag: 'label',
              innerHtml: 'Label'
            },
            components: [ ]
          }
        }
      });

      return GuiFactory.build(
        {
          uiType: 'container',
          components: [
            inputA
          ]
        }
      );

    }, function (doc, body, gui, component, store) {

      var inputA = component.getSystem().getByUid('input-a').getOrDie();

      return [
        Step.sync(function () {
          var val = Representing.getValue(inputA);
          Assertions.assertEq('Checking input-a value', 'Init', val.text);
        }),

        Step.fail('done')
      ];
    }, function () { success(); }, failure);

  }
);