define(
  'ephox.alloy.behaviour.sliding.SlidingSchema',

  [
    'ephox.alloy.data.Fields',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.sugar.api.view.Height',
    'ephox.sugar.api.view.Width'
  ],

  function (Fields, FieldSchema, ValueSchema, Height, Width) {
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
          width: [
            Fields.output('property', 'width'),
            Fields.output('getDimension', function (elem) {
              return Width.get(elem) + 'px';
            })
          ],
          height: [
            Fields.output('property', 'height'),
            Fields.output('getDimension', function (elem) {
              return Height.get(elem) + 'px';
            })
          ]
        }
      ))

    ];
  }
);