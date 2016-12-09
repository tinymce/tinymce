define(
  'ephox.alloy.ui.crazy.FormSpec',

  [
    'ephox.alloy.api.behaviour.Representing',
    'ephox.compass.Obj'
  ],

  function (Representing, Obj) {
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
                  // Here
                  var field = form.getSystem().getByUid(pUid).getOrDie();
                })
                var partComps = Arr.map(parts, function (p) {
                  return 
                })
                // TODO: part components here.
                return Obj.map(parts, Representing.getValue);
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