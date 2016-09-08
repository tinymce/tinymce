asynctest(
  'CouplingTest',
 
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.StepUtils',
    'global!Error'
  ],
 
  function (Assertions, Step, GuiFactory, GuiSetup, StepUtils, Error) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        uid: 'primary',
        coupling: {
          others: {
            'secondary-1': function (primary) { 
              return {
                uiType: 'button',
                action: store.adder('secondary-1-action'),
                text: 'Click me'
              };
            }
          }
        }
      });

    }, function (doc, body, gui, component, store) {
      return [
        StepUtils.sAssertFailIs(
          'Testing getCoupled with invalid name',
          'No information found for coupled component: fake',
          function () {
            component.apis().getCoupled('fake');
          }
        )
      ];
    }, function () { success(); }, failure);

  }
);