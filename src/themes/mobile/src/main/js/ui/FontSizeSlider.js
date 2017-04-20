define(
  'tinymce.themes.mobile.ui.FontSizeSlider',

  [
    'ephox.alloy.api.ui.Slider',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.ui.ToolbarWidgets',
    'tinymce.themes.mobile.util.FontSizes'
  ],

  function (Slider, Styles, ToolbarWidgets, FontSizes) {
    var sizes = FontSizes.candidates();

    var makeSlider = function (spec) {
      var onChange = function (slider, thumb, valueIndex) {
        // Slider has index values
        spec.onChange(slider, valueIndex);
      };

      return Slider.sketch({
        dom: {
          tag: 'div',
          classes: [ Styles.resolve('slider-font-size-container'), Styles.resolve('slider') ]
        },
        onChange: onChange,
        min: 0,
        max: sizes.length - 1,
        stepSize: 1,
        getInitialValue: spec.getInitialValue,
        snapToGrid: true,

        components: [
          Slider.parts().spectrum(),
          Slider.parts().thumb()
        ],

        parts: {
          spectrum: {
            dom: {
              tag: 'div',
              classes: [ Styles.resolve('slider-font-size-container') ]
            },
            components: [
              { 
                dom: {
                  tag: 'div',
                  classes: [ Styles.resolve('slider-font-size') ]
                }
              }
            ]
          },
          thumb: {
            dom: {
              tag: 'div',
              classes: [ Styles.resolve('slider-thumb') ]
            }
          }
        }
      });
    };

    var makeItems = function (spec) {
      return [
        {
          dom: {
            tag: 'span',
            classes: [ Styles.resolve('toolbar-button'), Styles.resolve('icon-small-font') ]
          }
        },
        makeSlider(spec),
        {
          dom: {
            tag: 'span',
            classes: [ Styles.resolve('toolbar-button'), Styles.resolve('icon-large-font') ]
          }
        }
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
