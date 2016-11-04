define(
  'ephox.alloy.api.ui.DialogApis',

  [

  ],

  function () {
    var showDialog = function (dialog) {
      dialog.apis().showDialog();
    };

    var hideDialog = function (dialog) {
      dialog.apis().hideDialog();
    };

    var getBody = function (dialog) {
      return dialog.apis().getBody();
    };

    return {
      showDialog: showDialog,
      hideDialog: hideDialog,
      getBody: getBody
    };
  }
);