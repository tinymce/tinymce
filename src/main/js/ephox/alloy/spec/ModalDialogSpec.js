define(
  'ephox.alloy.spec.ModalDialogSpec',

  [
    'ephox.highway.Merger'
  ],

  function (Merger) {
    var make = function (spec) {
      return Merger.deepMerge(
        spec,
        {
          uiType: 'custom'
        }
      );
    };

    return {
      make: make
    };
  }
);