define(
  'ephox.alloy.ui.schema.SplitDropdownSchema',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Tabstopping',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.InternalSink',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (Behaviour, Focusing, Tabstopping, Toggling, SystemEvents, Button, Fields, InternalSink, PartType, FieldSchema, Fun) {
    var schema = [
      FieldSchema.strict('toggleClass'),
      FieldSchema.strict('fetch'),

      Fields.onStrictHandler('onExecute'),
      FieldSchema.option('lazySink'),
      FieldSchema.strict('dom'),
      Fields.onHandler('onOpen'),
      // Fields.onHandler('onClose'),

      FieldSchema.defaulted('matchWidth', false)
    ];

    var arrowPart = PartType.internal(
      Button,
      [
        FieldSchema.strict('dom')
      ],
      'arrow',
      '<alloy.split-dropdown.arrow>',
      function (detail) {
        return {
          dom: {
            attributes: {
              role: 'button'
            }
          },
          buttonBehaviours: Behaviour.derive([
            Tabstopping.revoke(),
            Focusing.revoke()
          ])
        };
      },
      function (detail) {
        return {
          action: function (arrow) {
            var hotspot = arrow.getSystem().getByUid(detail.uid()).getOrDie();
            hotspot.getSystem().triggerEvent(SystemEvents.execute(), hotspot.element(), { });
          },
          buttonBehaviours: Behaviour.derive([
            Toggling.config({
              toggleOnExecute: false,
              toggleClass: detail.toggleClass(),
              aria: {
                mode: 'pressed'
              }
            })
          ])
        };
      }
    );

    var buttonPart = PartType.internal(
      Button,
      [
        FieldSchema.strict('dom')
      ],
      'button',
      '<alloy.split-dropdown.button>',
      function (detail) {
        return {
          dom: {
            attributes: {
              role: 'button'
            }
          },
          buttonBehaviours: Behaviour.derive([
            Focusing.revoke()
          ])
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
        { sketch: Fun.identity },
        [
          Fields.tieredMenuMarkers(),
          Fields.members([ 'menu', 'item' ])
        ],
        'menu', 
        function (detail) {
          return {
            onExecute: detail.onExecute()
          };
        },
        Fun.constant({ })
      ),
      InternalSink.partType()
    ];

    return {
      name: Fun.constant('SplitDropdown'),
      schema: Fun.constant(schema),
      parts: Fun.constant(partTypes)
    }
  }
);