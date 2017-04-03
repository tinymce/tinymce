define(
  'ephox.alloy.ui.slider.SliderSchema',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.sand.api.PlatformDetection'
  ],

  function (FieldSchema, Cell, Fun, PlatformDetection) {
    var isTouch = PlatformDetection.detect().deviceType.isTouch();
    
    return [
      FieldSchema.strict('min'),
      FieldSchema.strict('max'),
      FieldSchema.defaulted('stepSize', 1),
      FieldSchema.defaulted('onChange', Fun.noop),
      FieldSchema.defaulted('snapToGrid', false),
      FieldSchema.option('snapStart'),
      FieldSchema.strict('getInitialValue'),
      
      FieldSchema.state('value', function (spec) { return Cell(spec.min); })
    ].concat(! isTouch ? [
      // Only add if not on a touch device
      FieldSchema.state('mouseIsDown', function () { return Cell(false); })
    ] : [ ]);
  }
);