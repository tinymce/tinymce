define(
  'ephox.alloy.behaviour.sliding.SlidingSchema',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Height',
    'ephox.sugar.api.Width'
  ],

  function (FieldSchema, ValueSchema, Fun, Height, Width) {
    return [
      FieldSchema.strict('closedStyle'),
      FieldSchema.strict('openStyle'),
      FieldSchema.strict('shrinkingStyle'),
      FieldSchema.strict('growingStyle'),

      // Element which shrinking and growing animations
      FieldSchema.option('getAnimationRoot'),

      FieldSchema.defaulted('onShrunk', function () { }),
      FieldSchema.defaulted('onStartShrink', function () { }),
      FieldSchema.defaulted('onGrown', function () { }),
      FieldSchema.defaulted('onStartGrow', function () { }),
      FieldSchema.defaulted('expanded', false),

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