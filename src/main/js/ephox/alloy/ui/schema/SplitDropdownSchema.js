define(
  'ephox.alloy.ui.schema.SplitDropdownSchema',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Tabstopping',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.events.AlloyTriggers',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.InternalSink',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (Behaviour, Focusing, Tabstopping, Toggling, AlloyTriggers, Button, Fields, InternalSink, PartType, FieldSchema, Fun) {
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

    var arrowPart = PartType.required({
      factory: Button,
      schema: [ FieldSchema.strict('dom') ],
      name: 'arrow',
      defaults: function (detail) {
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
      overrides: function (detail) {
        return {
          action: function (arrow) {
            arrow.getSystem().getByUid(detail.uid()).each(AlloyTriggers.emitExecute);
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
    });

    var buttonPart = PartType.required({
      factory: Button,
      schema: [ FieldSchema.strict('dom') ],
      name: 'button',
      defaults: function (detail) {
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
      overrides: function (detail) {
        return {
          action: detail.onExecute()
        };
      }
    });

    var partTypes = [
      arrowPart,
      buttonPart,

      PartType.external({
        schema: [
          Fields.tieredMenuMarkers()
        ],
        name: 'menu',
        defaults: function (detail) {
          return {
            onExecute: detail.onExecute()
          };
        }
      }),

      InternalSink.partType()
    ];

    return {
      name: Fun.constant('SplitDropdown'),
      schema: Fun.constant(schema),
      parts: Fun.constant(partTypes)
    };
  }
);