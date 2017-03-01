define(
  'ephox.alloy.behaviour.sliding.SlidingSchema',

  [
    'ephox.alloy.data.Fields',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Cell',
    'ephox.sugar.api.view.Height',
    'ephox.sugar.api.view.Width'
  ],

  function (Fields, FieldSchema, ValueSchema, Cell, Height, Width) {
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

      FieldSchema.state('state', function (spec) { return Cell(spec.expanded); }),

      FieldSchema.strictOf('dimension', ValueSchema.choose(
        'property', {
          width: [
            FieldSchema.state('property', function () { return 'width'; } ),
            FieldSchema.state('getDimension', function () {
              return function (elem) {
                return Width.get(elem) + 'px';
              };
            })
          ],
          height: [
            FieldSchema.state('property', function () { return 'height'; } ),
            FieldSchema.state('getDimension', function () {
              return function (elem) {
                return Height.get(elem) + 'px';
              };
            })
          ]
        }
      ))

    ];
  }
);