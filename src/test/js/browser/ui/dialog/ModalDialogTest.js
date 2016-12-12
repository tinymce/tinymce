asynctest(
  'ModalDialogTest',
 
  [
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.ui.ModalDialog',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (Step, GuiFactory, ModalDialog, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        ModalDialog.build({
          dom: {
            tag: 'div'
          },
          components: [
            ModalDialog.parts().title(),
            ModalDialog.parts().close(),
            ModalDialog.parts().body(),
            ModalDialog.parts().footer()
          ],

          parts: {
            title: {
              dom: {
                tag: 'div'
              },
              components: [ ]
            },
            close: {
              dom: {
                tag: 'div'
              },
              components: [ ]
            },
            body: {
              dom: {
                tag: 'div'
              },
              components: [ ]
            },
            footer: {
              dom: {
                tag: 'div'
              },
              components: [ ]
            }
          }
        })
      );

    }, function (doc, body, gui, component, store) {
      return [
        Step.fail('fake')
      ];
    }, function () { success(); }, failure);

  }
);