define(
  'ephox.alloy.api.ui.Button',

  [
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.ui.common.ButtonBase',
    'ephox.alloy.ui.schema.ButtonSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger'
  ],

  function (UiBuilder, ButtonBase, ButtonSchema, FieldSchema, Merger) {
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

        spec,

        {
          dom: {
            attributes: {
              type: 'button',
              role: detail.role().getOr('button')
            }
          }
        }
      );
    };

    // Dupe with Tiered Menu
    var build = function (spec) {
      return UiBuilder.single(ButtonSchema.name(), ButtonSchema.schema(), make, spec);
    };

    return {
      build: build
    };
  }
);