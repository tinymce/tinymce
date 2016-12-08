define(
  'ephox.alloy.ui.single.ButtonSpec',

  [
    'ephox.alloy.ui.common.ButtonBase',
    'ephox.highway.Merger'
  ],

  function (ButtonBase, Merger) {
    var make = function (detail, spec) {
      
      var events = ButtonBase.events(detail.action());

      return Merger.deepMerge(
        {
          events: events
        },

        {
          behaviours: {
            focusing: true,
            keying: {
              mode: 'execution',
              useSpace: true,
              useEnter: true
            }
          }
        },

        {
          dom: {
            attributes: {
              type: 'button',
              role: detail.role().getOr('button')
            }
          }
        },

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