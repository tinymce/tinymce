define(
  'ephox.alloy.ui.schema.SplitDropdownSchema',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Coupling',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.component.SketchBehaviours',
    'ephox.alloy.api.events.AlloyTriggers',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.InternalSink',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (Behaviour, Coupling, Focusing, Keying, Toggling, SketchBehaviours, AlloyTriggers, Button, Fields, InternalSink, PartType, FieldSchema, Fun) {
    var schema = [
      FieldSchema.strict('toggleClass'),
      FieldSchema.strict('fetch'),

      Fields.onStrictHandler('onExecute'),
      Fields.onStrictHandler('onItemExecute'),
      FieldSchema.option('lazySink'),
      FieldSchema.strict('dom'),
      Fields.onHandler('onOpen'),
      SketchBehaviours.field('splitDropdownBehaviours', [ Coupling, Keying, Focusing ]),
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
            // TODO: Remove all traces of revoking
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
            // TODO: Remove all traces of revoking
            Focusing.revoke()
          ])
        };
      },
      overrides: function (detail) {
        return {
          action: function (btn) {
            btn.getSystem().getByUid(detail.uid()).each(function (splitDropdown) {
              detail.onExecute()(splitDropdown, btn);
            });
          }
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
            onExecute: function (tmenu, item) {
              tmenu.getSystem().getByUid(detail.uid()).each(function (splitDropdown) {
                detail.onItemExecute()(splitDropdown, tmenu, item);
              });
            }
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