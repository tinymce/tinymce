asynctest(
  'InlineDialogTest',
 
  [
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (Step, GuiFactory, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div',
          classes: [ 'inline-dialog-example'],
          styles: {
            background: 'white',
            border: '1px solid black',
            padding: '5px',
            display: 'inline-block'
          }
        },
        uid: 'uid-dialog',
        keying: {
          mode: 'cyclic',
          onEscape: store.adder('dialog.escape')
        },
        components: [
          {
            uiType: 'custom',
            dom: {
              tag: 'input'
            },
            tabstopping: true,
            focusing: true
          },
          {
            uiType: 'button',
            action: store.adder('dialog.execute'),
            text: 'Click me'
          }
        ]
      });

    }, function (doc, body, gui, component, store) {

      return [
        Step.sync(function () {
          component.apis().focusIn();
        }),
        function () { }
      ];
    }, success, failure);
  }
);