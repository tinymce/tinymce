define(
  'tinymce.themes.mobile.ui.FontSizeSlider',

  [
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.Slider',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Option',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.ui.Buttons',
    'tinymce.themes.mobile.ui.TinyFormatting',
    'tinymce.themes.mobile.util.FormatChangers'
  ],

  function (Representing, SystemEvents, Slider, Objects, Arr, Merger, Option, Styles, Buttons, TinyFormatting, FormatChangers) {
    var sizes = FormatChangers.fontSizes();

    var indexToSize = function (index) {
      return Option.from(sizes[index]);
    };

    var sizeToIndex = function (size) {
      return Arr.findIndex(sizes, function (v) {
        return v === size;
      });
    };

    var makeSlider = function (spec) {
      var onChange = function (slider, thumb, valueIndex) {
        indexToSize(valueIndex).each(function (size) {
          spec.onChange(slider, thumb, size);
        });
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
      })
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
          onChange: function (slider, thumb, value) {
            var currentValue = FormatChangers.getFontSize(editor);
            if (currentValue !== value) {
              editor.execCommand('fontSize', false, value);
            }
          },
          getInitialValue: function (slider) {
            var value = FormatChangers.getFontSize(editor);
            // 2 is the default size.
            return sizeToIndex(value).getOr(2);
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
