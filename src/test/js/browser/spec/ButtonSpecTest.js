asynctest(
  'ButtonSpecTest',
 
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (GeneralSteps, Logger, Mouse, Step, GuiFactory, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build({
        uiType: 'button',
        buttonType: 'text',
        text: 'ButtonSpecTest.button',
        action: store.adder('button.action')
      });

    }, function (doc, body, gui, component, store) {
      var testButtonClick = Logger.t(
        'testing button click',
        GeneralSteps.sequence([
          store.sAssertEq('step 1: no clicks', [ ]),
          Mouse.sClickOn(gui.element(), 'button'),
          store.sAssertEq('step 2: post click', [ 'button.action' ])
        ])
      );

      return [
        // Test clicking
        testButtonClick,

        // Test executing


        Step.wait(100000000000)
      ];
    }, success, failure);
 
  }
);