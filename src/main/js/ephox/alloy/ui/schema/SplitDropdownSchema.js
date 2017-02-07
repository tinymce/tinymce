define(
  'ephox.alloy.ui.schema.SplitDropdownSchema',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.parts.InternalSink',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun'
  ],

  function (Behaviour, SystemEvents, Button, InternalSink, PartType, FieldSchema, Fun) {
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
      Button,
      'arrow',
      '<alloy.split-dropdown.arrow>',
      function (detail) {
        return {
          dom: {
            attributes: {
              role: 'button'
            }
          },
          behaviours: {
            tabstopping: Behaviour.revoke(),
            focusing: Behaviour.revoke()
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
              toggleOnExecute: false,
              toggleClass: detail.toggleClass()
            }
          }
        };
      }
    );

    var buttonPart = PartType.internal(
      Button,
      'button',
      '<alloy.split-dropdown.button>',
      function (detail) {
        return {
          dom: {
            attributes: {
              role: 'button'
            }
          },
          behaviours: {
            focusing: Behaviour.revoke()
          }
        };
      },
      function (detail) {
        return {
          action: detail.onExecute()
        };
      }
    );

    var partTypes = [
      arrowPart,
      buttonPart,
      PartType.external(
        { build: Fun.identity },
        'menu', 
        function (detail) {
          return {
            onExecute: detail.onExecute()
          };
        },
        Fun.constant({ })
      ),
      InternalSink
    ];

    return {
      name: Fun.constant('SplitDropdown'),
      schema: Fun.constant(schema),
      parts: Fun.constant(partTypes)
    }
  }
);