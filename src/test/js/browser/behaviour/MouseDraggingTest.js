asynctest(
  'MouseDraggingTest',
 
  [
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.Memento',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (Keyboard, Keys, Step, GuiFactory, Memento, EventHandler, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var subject = Memento.record({
      uiType: 'container',
      dom: {
        styles: {
          'width': '100px',
          height: '100px',
          border: '1px solid green'
        }
      },
      behaviours: {
        dragging: {
          mode: 'mouse'
        }
      }
    });

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build({
        uiType: 'container',
        components: [
          subject.asSpec()
        ]
      });
    }, function (doc, body, gui, component, store) {
      return [
        Step.fail('10')
      ];
    }, function () { success(); }, failure);

  }
);