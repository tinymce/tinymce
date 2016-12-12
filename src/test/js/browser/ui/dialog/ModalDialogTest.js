asynctest(
  'ModalDialogTest',
 
  [
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.ui.ModalDialog',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (GuiFactory, ModalDialog, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        ModalDialog.build({ })
      );

    }, function (doc, body, gui, component, store) {
      return [
        
      ];
    }, function () { success(); }, failure);

  }
);