asynctest(
  'ButtonSpecTest',
 
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (Assertions, GeneralSteps, Logger, Mouse, Step, GuiFactory, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build({
        uiType: 'button',
        buttonType: 'text',
        text: 'ButtonSpecTest.button',
        action: store.adder('button.action'),
        clazz: 'test-button'
      });

    }, function (doc, body, gui, component, store) {
      var testStructure = Step.sync(function () {
        Assertions.assertStructure(
          'Checking initial structure of button',
          {},
          {}
        );
      });
      // TODOTODTODTO TODO HERE HERE HERE
      var testButtonClick = Logger.t(
        'testing button click',
        GeneralSteps.sequence([
          store.sAssertEq('step 1: no clicks', [ ]),
          Mouse.sClickOn(gui.element(), 'button'),
          store.sAssertEq('step 2: post click', [ 'button.action' ])
        ])
      );

      return [
        // Test structure
        testStructure,
        // Test clicking
        testButtonClick,

        // Test executing


        Step.wait(100000000000)
      ];
    }, success, failure);
 
  }
);