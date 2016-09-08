asynctest(
  'StreamingTest',
 
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiControls',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (GeneralSteps, Mouse, Step, UiControls, GuiFactory, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'input'
        },
        streaming: {
          stream: {
            mode: 'throttle',
            delay: 500
          },
          event: 'click',
          onStream: store.adder('onStream')
        }
      });

    }, function (doc, body, gui, component, store) {
      return [
        GeneralSteps.sequenceRepeat(
          5,
          GeneralSteps.sequence([
            Mouse.sClickOn(gui.element(), 'input'),
            Step.wait(10)
          ])
        ),

        Step.wait(500),
        store.sAssertEq('Should have only fired one event', [ 'onStream' ]),
        
        GeneralSteps.sequenceRepeat(
          5,
          GeneralSteps.sequence([
            Mouse.sClickOn(gui.element(), 'input'),
            Step.wait(10)
          ])
        ),
        Step.wait(500),
        store.sAssertEq('Should have only fired two events', [ 'onStream', 'onStream' ])
      ];
    }, function () { success(); }, failure);

  }
);