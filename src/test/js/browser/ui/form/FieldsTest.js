asynctest(
  'Fields Ui',
 
  [
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.ui.Form',
    'ephox.alloy.api.ui.FormInput',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.test.GuiSetup',
    'ephox.peanut.Fun'
  ],
 
  function (Keyboard, Keys, Step, GuiFactory, Form, FormInput, EventHandler, GuiSetup, Fun) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        {
          uiType: 'container',
          components: [
            FormInput.build({
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
            })
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