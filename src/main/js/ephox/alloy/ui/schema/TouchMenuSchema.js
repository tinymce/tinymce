define(
  'ephox.alloy.ui.schema.TouchMenuSchema',

  [
    'ephox.alloy.api.behaviour.Coupling',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.behaviour.Unselecting',
    'ephox.alloy.api.component.SketchBehaviours',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.InternalSink',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.positioning.layout.Layout',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.view.Height',
    'ephox.sugar.api.view.Location',
    'ephox.sugar.api.view.Width'
  ],

  function (Coupling, Toggling, Unselecting, SketchBehaviours, Fields, InternalSink, PartType, Layout, FieldSchema, Fun, Height, Location, Width) {
    var anchorAtCentre = function (component) {
      var pos = Location.absolute(component.element());
      var w = Width.get(component.element());
      var h = Height.get(component.element());
      return {
        anchor: 'makeshift',
        x: pos.left() + w / 2,
        y: pos.top() + h / 2,
        layouts: [ Layout.southmiddle, Layout.northmiddle ]
      };
    };

    // Similar to dropdown.
    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.strict('fetch'),
      Fields.onHandler('onOpen'),
      Fields.onKeyboardHandler('onExecute'),
      Fields.onHandler('onTap'),
      Fields.onHandler('onHoverOn'),
      Fields.onHandler('onHoverOff'),
      Fields.onHandler('onMiss'),
      SketchBehaviours.field('touchmenuBehaviours', [ Toggling, Unselecting, Coupling ]),
      FieldSchema.strict('toggleClass'),
      FieldSchema.option('lazySink'),
      FieldSchema.option('role'),
      FieldSchema.defaulted('eventOrder', { }),

      Fields.onHandler('onClosed'),

      FieldSchema.option('menuTransition'),

      FieldSchema.defaulted('getAnchor', anchorAtCentre)
    ];

    var partTypes = [
      PartType.external({
        schema: [
          Fields.itemMarkers()
        ],
        name: 'menu'
      }),

      PartType.external({
        schema: [ FieldSchema.strict('dom') ],
        name: 'view'
      }),

      InternalSink.partType()
    ];

    return {
      name: Fun.constant('TouchMenu'),
      schema: Fun.constant(schema),
      parts: Fun.constant(partTypes)
    };
  }
);
