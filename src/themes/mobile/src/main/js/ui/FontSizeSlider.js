define(
  'tinymce.themes.mobile.ui.FontSizeSlider',

  [
    'ephox.alloy.api.ui.Slider',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.ui.Buttons',
    'tinymce.themes.mobile.util.FontSizes'
  ],

  function (Slider, Styles, Buttons, FontSizes) {
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
              classes: [ Styles.resolve('slider-font-size') ]
            }
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

    var makeItems = function (editor) {
      return [
        {
          dom: {
            tag: 'span',
            classes: [ Styles.resolve('toolbar-button'), Styles.resolve('toolbar-button-small-font') ]
          }
        },
        makeSlider({
          onChange: function (slider, value) {
            FontSizes.apply(editor, value);
          },
          getInitialValue: function (slider) {
            return FontSizes.get(editor);
          }
        }),
        {
          dom: {
            tag: 'span',
            classes: [ Styles.resolve('toolbar-button'), Styles.resolve('toolbar-button-large-font') ]
          }
        }
      ];
    };

    var sketch = function (ios, editor) {
      return Buttons.forToolbar('font-size', function () {
        var items = makeItems(editor);
        ios.setContextToolbar([
          {
            label: 'font-size',
            items: items
          }
        ]);
      }, { }, { });

    };

    return {
      makeItems: makeItems,
      sketch: sketch
    };
  }
);
