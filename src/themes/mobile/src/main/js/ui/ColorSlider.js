define(
  'tinymce.themes.mobile.ui.ColorSlider',

  [
    'ephox.alloy.api.ui.Slider',
    'ephox.sugar.api.properties.Css',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.ui.ToolbarWidgets'
  ],

  function (Slider, Css, Styles, ToolbarWidgets) {
    var BLACK = -1;

    var makeSlider = function (spec) {
      var onChange = function (slider, thumb, value) {
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

        var color = getColor(value);
        // TODO: Find a way to do this in alloy.
        Css.set(thumb.element(), 'background', color);
        spec.onChange(slider, thumb, color);
      };

      return Slider.sketch({
        dom: {
          tag: 'div',
          classes: [ Styles.resolve('slider'), Styles.resolve('hue-slider-container') ]
        },
        components: [
          Slider.parts()['left-edge'](),
          Slider.parts().spectrum(),
          Slider.parts()['right-edge'](),
          Slider.parts().thumb()
        ],

        onChange: onChange,
        stepSize: 10,
        min: 0,
        max: 360,
        getInitialValue: spec.getInitialValue,

        parts: {
          spectrum: {
            dom: {
              tag: 'div',
              classes: [ Styles.resolve('slider-gradient-container') ]
            },
            components: [
              {
                dom: {
                  tag: 'div',
                  classes: [ Styles.resolve('slider-gradient') ]
                }
              }
            ]
          },
          thumb: {
            dom: {
              tag: 'div',
              classes: [ Styles.resolve('slider-thumb') ]
            }
          },
          'left-edge': {
            dom: {
              tag: 'div',
              classes: [ Styles.resolve('hue-slider-black') ]
            }
          },
          'right-edge': {
            dom: {
              tag: 'div',
              classes: [ Styles.resolve('hue-slider-white') ]
            }
          }
        }
      });
    };

    var makeItems = function (spec) {
      return [
        makeSlider(spec)
      ];
    };

    var sketch = function (ios, editor) {
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

      return ToolbarWidgets.button(ios, 'color', function () {
        return makeItems(spec);
      });
    };

    return {
      makeItems: makeItems,
      sketch: sketch
    };
  }
);