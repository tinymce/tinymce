define(
  'ephox.alloy.ui.crazy.FormSpec',

  [
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.compass.Obj',
    'ephox.perhaps.Option'
  ],

  function (Composing, Representing, Obj, Option) {
    // FIX: Move
    var make = function (detail, components, spec) {
      return {
        uiType: 'custom',
        dom: detail.dom(),
        components: components,

        behaviours: {
          representing: {
            store: {
              mode: 'manual',
              getValue: function (form) {
                var partUids = detail.partUids();
                return Obj.map(partUids, function (pUid, pName) {
                  return form.getSystem().getByUid(pUid).fold(Option.none, Option.some).bind(Composing.getCurrent).map(Representing.getValue);
                });
              },
              setValue: function (form, values) {
                var parts = detail.parts();
              }
            }
          }
        }
      };

    };

    return {
      make: make
    };
  }
);