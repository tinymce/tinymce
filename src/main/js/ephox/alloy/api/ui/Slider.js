define(
  'ephox.alloy.api.ui.Slider',

  [
    'ephox.alloy.api.ui.Sketcher',
    'ephox.alloy.ui.slider.SliderParts',
    'ephox.alloy.ui.slider.SliderSchema',
    'ephox.alloy.ui.slider.SliderUi',
    'global!Math'
  ],

  function (Sketcher, SliderParts, SliderSchema, SliderUi, Math) {
    return Sketcher.composite({
      name: 'Slider',
      configFields: SliderSchema,
      partFields: SliderParts,
      factory: SliderUi.sketch,
      apis: {
        resetToMin: function (apis, slider) {
          apis.resetToMin(slider);
        },
        resetToMax: function (apis, slider) {
          apis.resetToMax(slider);
        },
        refresh: function (apis, slider) {
          apis.refresh(slider);
        }
      }
    });
  }
);