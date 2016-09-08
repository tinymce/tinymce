asynctest(
  'SandboxingTest',
 
  [
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.sandbox.Manager',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.Sinks'
  ],
 
  function (Step, GuiFactory, Manager, GuiSetup, Sinks) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      var sink = Sinks.fixedSink();

      return GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        components: [
          { built: sink },
          {
            uiType: 'custom',
            dom: {
              tag: 'div'
            },
            uid: 'subject-sandbox',
            sandboxing: {
              sink: sink,
              manager: Manager.contract({ })
            }
          }
        ]
      });

    }, function (doc, body, gui, component, store) {
      return [
        Step.debugging
      ];
    }, function () { success(); }, failure);

  }
);