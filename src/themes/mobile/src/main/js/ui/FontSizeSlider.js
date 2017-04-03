define(
  'tinymce.themes.mobile.ui.FontSizeSlider',

  [
    'ephox.alloy.api.ui.Slider',
    'ephox.boulder.api.Objects',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.ui.Buttons'
  ],

  function (Slider, Objects, Styles, Buttons) {
    var sizes = {
      '0': '8pt',
      '1': '10pt',
      '2': '12pt',
      '3': '14pt',
      '4': '18pt',
      '5': '24pt',
      '6': '36pt'
    };

    var makeSlider = function (spec) {
      var onChange = function (slider, thumb, value) {
        Objects.readOptFrom(sizes, value).each(function (pts) {
          spec.onChange(slider, thumb, pts);
        });
      };

      /*
      <div data-alloy-id="memento_774581782521491181599636" tabindex="-1" class="tinymce-mobile-toolbar-group-item tinymce-mobile-slider tinymce-mobile-slider-font-size-container">
        <div data-alloy-id="uid_827512247511491181599636" role="presentation" class="tinymce-mobile-slider-font-size"></div>
        <div data-alloy-id="memento_132085308501491181599636" class="tinymce-mobile-slider-thumb"></div>
      </div>
      */

      return Slider.sketch({
        dom: {
          tag: 'div',
          classes: [ Styles.resolve('slider-font-size-container'), Styles.resolve('slider') ]
        },
        onChange: onChange,
        min: 0,
        max: 6,
        stepSize: 1,
        initialValue: 2,
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

    var sketch = function (ios, editor) {
      return Buttons.forToolbar('font-size', function () {
        ios.setContextToolbar([
          {
            label: 'font-size',
            items: [
              {
                dom: {
                  tag: 'span',
                  classes: [ Styles.resolve('toolbar-button'), Styles.resolve('toolbar-button-small-font') ]
                }
              },
              makeSlider({
                onChange: function (slider, thumb, value) {
                  editor.execCommand('fontSize', false, value);
                }
              }),
              {
                dom: {
                  tag: 'span',
                  classes: [ Styles.resolve('toolbar-button'), Styles.resolve('toolbar-button-large-font') ]
                }
              }
            ]
          }
        ]);
      }, { }, { });

    };

    return {
      sketch: sketch
    };
  }
);
