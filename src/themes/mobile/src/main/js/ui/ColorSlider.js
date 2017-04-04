define(
  'tinymce.themes.mobile.ui.ColorSlider',

  [
    'ephox.alloy.api.ui.Slider',
    'ephox.sugar.api.properties.Css',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.ui.Buttons'
  ],

  function (Slider, Css, Styles, Buttons) {
    var BLACK = -1;
    
    var makeSlider = function (spec) {
      var onChange = function (slider, thumb, value) {
        var getColor = function (hue) {
          // Handle edges.
          if (hue < 0) return 'black';
          else if (hue > 360) return 'white';
          else return 'hsl(' + hue + ', 100%, 50%)';
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
        stepSizes: 10,
        min: 0,
        max: 360,
        getInitialValue: spec.getInitialValue,

        parts: {
          spectrum: {
            dom: {
              tag: 'div',
              classes: [ Styles.resolve('slider-gradient') ]
            }
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

    var makeItems = function (editor) {
      return [
        makeSlider({
          onChange: function (slider, thumb, color) {
            editor.undoManager.transact(function () {
              editor.formatter.apply('forecolor', { value: color });
              editor.nodeChanged();
            });
          },
          getInitialValue: function (slider) {
            // Return black
            return BLACK;
          }
        })
      ];
    };

    var sketch = function (ios, editor) {
      // Dupe with Font Size Slider
      return Buttons.forToolbar('color', function () {
        var items = makeItems(editor);
        ios.setContextToolbar([
          {
            label: 'font-color',
            items: items
          }
        ]);
      }, { }, { });
    };

    return {
      sketch: sketch
    };
  }
);


/*
var hueSlider = HtmlDisplay.section(
        gui,
        'This is a basic color slider with a sliding thumb and edges',
        Slider.sketch({
          dom: {
            tag: 'div',
            styles: {
              border: '1px solid black'
            }
          },
          min: 0,
          max: 360,
          getInitialValue: Fun.constant(120),
          stepSize: 10,
          parts: {
            thumb: {
              dom: {
                tag: 'div',
                classes: [ ]
              }
            },
            spectrum: {
              dom: {
                tag: 'div',
                classes: [ ]
              }
            },
            'left-edge': { dom: { tag: 'div', classes: [ ]  } },
            'right-edge': { dom: { tag: 'div', classes: [ ]  } }
          },
          onChange: function (slider, thumb, value) {
            var getColor = function (hue) {
              if (hue < 0) return 'black';
              else if (hue > 360) return 'white';
              else return 'hsl(' + hue + ', 100%, 50%)';
            };

            Css.set(thumb.element(), 'background', getColor(value));
          },

          components: [
            Container.sketch({
              dom: {
                tag: 'div',
                styles: {
                  display: 'flex'
                }
              },
              components: [
                Slider.parts()['left-edge'](),
                Slider.parts().spectrum(),
                Slider.parts()['right-edge']()
              ]
            }),
            Slider.parts().thumb()
          ]
        })        
      );

      DomEvent.bind(body, 'click', function () {
        Keying.focusIn(hueSlider);
      });
    };
    */