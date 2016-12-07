define(
  'ephox.alloy.api.ui.SplitDropdown',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.parts.InternalSink',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.spec.SplitDropdownSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun',
    'global!Error'
  ],

  function (SystemEvents, CompositeBuilder, InternalSink, PartType, SplitDropdownSpec, FieldSchema, Fun, Error) {
    var schema = [
      FieldSchema.strict('toggleClass'),
      FieldSchema.strict('fetch'),
      FieldSchema.strict('onExecute'),
      FieldSchema.option('lazySink'),
      FieldSchema.strict('dom'),
      FieldSchema.defaulted('onOpen', Fun.noop),
      // FieldSchema.defaulted('onClose', Fun.noop),

      FieldSchema.defaulted('matchWidth', false)
    ];

    var arrowPart = PartType.internal(
      'arrow',
      '<alloy.split-dropdown.arrow>',
      function (detail) {
        return {
          // FIX: new style.
          uiType: 'button',
          behaviours: {
            // FIX undefined
            tabstopping: undefined,
            focusing: undefined
          }
        };
      },
      function (detail) {
        return {
          action: function (arrow) {
            var hotspot = arrow.getSystem().getByUid(detail.uid()).getOrDie();
            hotspot.getSystem().triggerEvent(SystemEvents.execute(), hotspot.element(), { });
          },
          behaviours: {
            toggling: {
              toggleOnExecute: false
            }
          }
        };
      }
    );

    var buttonPart = PartType.internal(
      'button',
      '<alloy.split-dropdown.button>',
      function (detail) {
        return {
          behaviours: {
          // FIX: Undefined false
            focusing: undefined
          }
        };
      },
      function (detail) {
        return {
          uiType: 'button',
          action: detail.onExecute()
        };
      }
    );

    var partTypes = [
      arrowPart,
      buttonPart,
      PartType.external('menu'),
      InternalSink
    ];

    var build = function (f) {
      return CompositeBuilder.build('split-dropdown', schema, partTypes, SplitDropdownSpec.make, f);
    };

    return {
      build: build
    };
  }
);