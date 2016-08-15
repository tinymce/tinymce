asynctest(
  'ButtonSpecTest',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (ApproxStructure, Assertions, GeneralSteps, Logger, Mouse, Step, GuiFactory, SystemEvents, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build({
        uiType: 'button',
        buttonType: 'text',
        text: 'ButtonSpecTest.button',
        action: store.adder('button.action'),
        classes: [ 'test-button' ],
        uid: 'test-button-id'
      });

    }, function (doc, body, gui, component, store) {
      var testStructure = Step.sync(function () {
        Assertions.assertStructure(
          'Checking initial structure of button',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('button', {
              classes: [
                arr.has('test-button')
              ],
              attrs: {
                type: str.is('input'),
                'alloy-id': str.is('test-button-id')
              },
              html: str.is('ButtonSpecTest.button')
            });
          }),
          component.element()
        );
      });
      
      var testButtonClick = Logger.t(
        'testing button click',
        GeneralSteps.sequence([
          store.sAssertEq('step 1: no clicks', [ ]),
          Mouse.sClickOn(gui.element(), 'button'),
          store.sAssertEq('step 2: post click', [ 'button.action' ])
        ])
      );

      var testExecuting = Logger.t(
        'testing dispatching execute',
        GeneralSteps.sequence([
          Step.sync(function () {
            store.clear();
            store.assertEq('post clear', [ ]);
            var system = component.getSystem();
            system.triggerEvent(SystemEvents.execute(), component.element(), {});
            store.assertEq('post execute', [ 'button.action' ]);
          })
        ])
      );

      return [
        // Test structure
        testStructure,
        // Test clicking
        testButtonClick,

        // Test executing
        testExecuting
      ];
    }, success, failure);
 
  }
);