define(
  'ephox.alloy.behaviour.sliding.SlidingSchema',

  [
    'ephox.alloy.data.Fields',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.view.Height',
    'ephox.sugar.api.view.Width'
  ],

  function (Fields, FieldSchema, Objects, ValueSchema, Cell, Fun, Option, Css, Height, Width) {
    var dimensionProp = function (property, getDimension) {
      return [
        Fields.output('initStyles', Objects.wrap(property, '0px')),
        Fields.output('getDimension', function (elem) {
          return getDimension(elem) + 'px';
        }),
        Fields.output('startShrink', function (component) {
          Css.set(component.element(), property, '0px');
        }),
        Fields.output('forceSize', function (component, slideConfig, slideState) {
          Css.set(component.element(), property, getDimension(component.element()) + 'px');
          Css.reflow(component.element());
        }),

        Fields.output('garfield', function (f) {
          var fullSize = measureTargetSize(component, slideConfig);
        }),

        Fields.output('clearSize', function (component, slideConfig, slideState) {
          Css.remove(component.element(), property);
        }),
        Fields.output('setSize', function (component, slideConfig, size) {
          Css.set(component.element(), property, size);
        }),
        Fields.output('onDone', function (rawEvent) {
          if (rawEvent.propertyName === property) {
            return Option.some(function (component, slideConfig, slideState) {
              // when showing, remove the dimension so it is responsive
              if (slideState.isExpanded()) Css.remove(component.element(), property);
            });
          } else {
            return Option.none();
          }
        })
      ];
    };
  
    return [
      FieldSchema.strict('closedClass'),
      FieldSchema.strict('openClass'),
      FieldSchema.strict('shrinkingClass'),
      FieldSchema.strict('growingClass'),

      // Element which shrinking and growing animations
      FieldSchema.option('getAnimationRoot'),

      Fields.onHandler('onShrunk'),
      Fields.onHandler('onStartShrink'),
      Fields.onHandler('onGrown'),
      Fields.onHandler('onStartGrow'),
      FieldSchema.defaulted('expanded', false),
      FieldSchema.strictOf('dimension', ValueSchema.choose(
        'property', {
          width: dimensionProp('width', Width.get),
          height: dimensionProp('height', Height.get),
          transform: [
            Fields.output('initStyles', { }),
            Fields.output('onDone', function (raw) {
              if (raw.propertyName === 'transform') return Option.some(Fun.noop);
              else return Option.none();
            }),
            Fields.output('getDimension', function (elem) {
              return '0px';
            }),
            Fields.output('startShrink', Fun.noop),
            Fields.output('forceSize', Fun.noop),
            Fields.output('clearSize', Fun.noop),
            Fields.output('setSize', Fun.noop)
          ]
        }
      ))

    ];
  }
);