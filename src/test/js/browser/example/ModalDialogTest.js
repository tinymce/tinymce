asynctest(
  'ModalDialogTest',
 
  [
 
  ],
 
  function () {
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
          onEscape: store.adder('dialog.escape'),
          onEnter: store.adder('dialog.execute')
        },
        components: [
          {
            uiType: 'custom',
            dom: {
              tag: 'input',
              value: 'initial'
            },
            tabstopping: true,
            focusing: {
              onFocus: function (component) {
                var input = component.element();
                var value = Value.get(input);
                input.dom().setSelectionRange(0, value.length);
              }
            }
          },
          {
            uiType: 'button',
            action: store.adder('button.execute'),
            text: 'Click me'
          }
        ]
      });

    }, function (doc, body, gui, component, store) {

      return [ ];

    }, success, failure);
  }
);