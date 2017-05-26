define(
  'tinymce.themes.mobile.ui.ColorSlider',

  [
    'ephox.alloy.api.ui.Slider',
    'ephox.sugar.api.properties.Css',
    'tinymce.themes.mobile.ui.ToolbarWidgets',
    'tinymce.themes.mobile.util.UiDomFactory'
  ],

  function (Slider, Css, ToolbarWidgets, UiDomFactory) {
    var BLACK = -1;

    var makeSlider = function (spec) {
      var getColor = function (hue) {
        // Handle edges.
        if (hue < 0) {
          return 'black';
        } else if (hue > 360) {
          return 'white';
        } else {
          return 'hsl(' + hue + ', 100%, 50%)';
        }
      };

      // Does not fire change intentionally.
      var onInit = function (slider, thumb, value) {
        var color = getColor(value);
        Css.set(thumb.element(), 'background', color);
      };

      var onChange = function (slider, thumb, value) {
        var color = getColor(value);
        Css.set(thumb.element(), 'background', color);
        spec.onChange(slider, thumb, color);
      };

      return Slider.sketch({
        dom: UiDomFactory.dom('<div class="${prefix}-slider ${prefix}-hue-slider-container"></div>'),
        components: [
          Slider.parts()['left-edge'](UiDomFactory.spec('<div class="${prefix}-hue-slider-black"></div>')),
          Slider.parts().spectrum({
            dom: UiDomFactory.dom('<div class="${prefix}-slider-gradient-container"></div>'),
            components: [
              UiDomFactory.spec('<div class="${prefix}-slider-gradient"></div>')
            ]
          }),
          Slider.parts()['right-edge'](UiDomFactory.spec('<div class="${prefix}-hue-slider-white"></div>')),
          Slider.parts().thumb(UiDomFactory.spec('<div class="${prefix}-slider-thumb"></div>'))
        ],

        onChange: onChange,
        onInit: onInit,
        stepSize: 10,
        min: 0,
        max: 360,
        getInitialValue: spec.getInitialValue
      });
    };

    var makeItems = function (spec) {
      return [
        makeSlider(spec)
      ];
    };

    var sketch = function (realm, editor) {
      var spec = {
        onChange: function (slider, thumb, color) {
          editor.undoManager.transact(function () {
            editor.formatter.apply('forecolor', { value: color });
            editor.nodeChanged();
          });
        },
        getInitialValue: function (/* slider */) {
          // Return black
          return BLACK;
        }
      };

      return ToolbarWidgets.button(realm, 'color', function () {
        return makeItems(spec);
      });
    };

    return {
      makeItems: makeItems,
      sketch: sketch
    };
  }
);