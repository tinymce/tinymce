define(
  'tinymce.themes.mobile.ui.FontSizeSlider',

  [
    'ephox.alloy.api.ui.Slider',
    'tinymce.themes.mobile.ui.ToolbarWidgets',
    'tinymce.themes.mobile.util.FontSizes',
    'tinymce.themes.mobile.util.UiDomFactory'
  ],

  function (Slider, ToolbarWidgets, FontSizes, UiDomFactory) {
    var sizes = FontSizes.candidates();

    var makeSlider = function (spec) {
      var onChange = function (slider, thumb, valueIndex) {
        // Slider has index values
        spec.onChange(slider, valueIndex);
      };

      return Slider.sketch({
        dom: UiDomFactory.dom('<div class="${prefix}-slider-font-size-container ${prefix}-slider"></div>'),
        onChange: onChange,
        min: 0,
        max: sizes.length - 1,
        stepSize: 1,
        getInitialValue: spec.getInitialValue,
        snapToGrid: true,

        components: [
          Slider.parts().spectrum({
            dom: UiDomFactory.dom('<div class="${prefix}-slider-font-size-container"></div>'),
            components: [
              UiDomFactory.spec('<div class="${prefix}-slider-font-size"></div>')
            ]
          }),
          Slider.parts().thumb(UiDomFactory.spec('<div class="${prefix}-slider-thumb"></div>'))
        ]
      });
    };

    var makeItems = function (spec) {
      return [
        UiDomFactory.spec('<span class="${prefix}-toolbar-button ${prefix}-icon-small-font ${prefix}-icon"></span>'),
        makeSlider(spec),
        UiDomFactory.spec('<span class="${prefix}-toolbar-button ${prefix}-icon-large-font ${prefix}-icon"></span>')
      ];
    };

    var sketch = function (realm, editor) {
      var spec = {
        onChange: function (slider, value) {
          FontSizes.apply(editor, value);
        },
        getInitialValue: function (/* slider */) {
          return FontSizes.get(editor);
        }
      };

      return ToolbarWidgets.button(realm, 'font-size', function () {
        return makeItems(spec);
      });
    };

    return {
      makeItems: makeItems,
      sketch: sketch
    };
  }
);
