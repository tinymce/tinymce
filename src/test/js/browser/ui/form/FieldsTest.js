asynctest(
  'Fields Ui',
 
  [
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.ui.FormInput',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (Step, GuiFactory, FormInput, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {

      var inputA = FormInput.build({
        dom: {
          tag: 'div'
        },
        components: [
          FormInput.parts().field(),
          FormInput.parts().label()
        ],
        parts: {
          field: { },
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
      return [
        Step.fail('Basic form demo')
      ];
    }, function () { success(); }, failure);

  }
);