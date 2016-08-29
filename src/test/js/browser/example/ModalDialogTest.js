asynctest(
  'ModalDialogTest',
 
  [
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (Keyboard, Keys, Step, GuiFactory, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div',
          classes: [ 'inline-dialog-example'],
          styles: {
            background: 'gray',
            border: '1px solid black',
            padding: '5px',
            width: '500px',
            height: '400px'
          }
        },
        uid: 'uid-dialog',
        keying: {
          mode: 'cyclic',
          onEscape: store.adder('dialog.escape'),
          onEnter: store.adder('dialog.execute')
        },
        components: [
          {
            uiType: 'input'
          },
          {
            uiType: 'input',
            value: 'next-value'
          }
        ]
      });

    }, function (doc, body, gui, component, store) {

      return [
        Step.sync(function () {
          component.apis().focusIn();
        }),

        Keyboard.sKeydown(doc, Keys.enter(), { }),
        store.sAssertEq('1. After enter, dialog.execute', [ 'dialog.execute' ]),
        store.sClear,

        Keyboard.sKeydown(doc, Keys.enter(), { shift: true }),
        store.sAssertEq('1. After shift+enter, nothing', [ ]),

        function () { }

      ];

    }, success, failure);
  }
);