define(
  'ephox.alloy.api.ui.Slider',

  [
    'ephox.alloy.api.ui.GuiTypes',
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.slider.SliderParts',
    'ephox.alloy.ui.slider.SliderSchema',
    'ephox.alloy.ui.slider.SliderUi',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger',
    'global!Math'
  ],

  function (GuiTypes, UiSketcher, PartType, SliderParts, SliderSchema, SliderUi, Fun, Merger, Math) {
    var name = 'slider';

    var sketch = function (spec) {
      return UiSketcher.composite(name, SliderSchema, SliderParts, SliderUi.sketch, spec);
    };

    var parts = PartType.generate(name, SliderParts);

    return Merger.deepMerge(
      {
        sketch: sketch,
        parts: Fun.constant(parts),
        schemas: Fun.constant({
          schema: Fun.constant(SliderSchema),
          name: Fun.constant('Slider'),
          parts: Fun.constant(SliderParts)
        }),
        resetToMin: GuiTypes.makeApi(function (apis, slider) {
          apis.resetToMin(slider);
        }),
        resetToMax: GuiTypes.makeApi(function (apis, slider) {
          apis.resetToMax(slider);
        })
      }
    );
  }
);