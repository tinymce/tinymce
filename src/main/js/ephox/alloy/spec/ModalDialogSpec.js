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
          uiType: 'custom',
          dom: {
            tag: 'div',
            styles: {
              position: ''
            },
            attributes: {
              role: 'dialog'
            }
          },
          keying: {
            mode: 'cyclic'
          }
        }
      );
    };

    return {
      make: make
    };
  }
);