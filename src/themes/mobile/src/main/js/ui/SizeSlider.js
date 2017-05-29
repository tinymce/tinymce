define(
  'tinymce.themes.mobile.ui.SizeSlider',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.ui.Slider',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'tinymce.themes.mobile.style.Styles'
  ],

  function (Behaviour, Toggling, Slider, FieldSchema, ValueSchema, Styles) {
    var schema = ValueSchema.objOfOnly([
      FieldSchema.strict('getInitialValue'),
      FieldSchema.strict('onChange'),
      FieldSchema.strict('category'),
      FieldSchema.strict('sizes')
    ]);

    var sketch = function (rawSpec) {
      var spec = ValueSchema.asRawOrDie('SizeSlider', schema, rawSpec);

      var isValidValue = function (valueIndex) {
        return valueIndex >= 0 && valueIndex < spec.sizes.length;
      };

      var onChange = function (slider, thumb, valueIndex) {
        if (isValidValue(valueIndex)) {
          spec.onChange(valueIndex);
        }
      };

      return Slider.sketch({
        dom: {
          tag: 'div',
          classes: [
            Styles.resolve('slider-' + spec.category + '-size-container'),
            Styles.resolve('slider'),
            Styles.resolve('slider-size-container') ]
        },
        onChange: onChange,
        onDragStart: function (slider, thumb) {
          Toggling.on(thumb);
        },
        onDragEnd: function (slider, thumb) {
          Toggling.off(thumb);
        },
        min: 0,
        max: spec.sizes.length - 1,
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
              classes: [ Styles.resolve('slider-size-container') ]
            },
            components: [
              {
                dom: {
                  tag: 'div',
                  classes: [ Styles.resolve('slider-size-line') ]
                }
              }
            ]
          },
          thumb: {
            dom: {
              tag: 'div',
              classes: [ Styles.resolve('slider-thumb') ]
            },
            behaviours: Behaviour.derive([
              Toggling.config({
                toggleClass: 'selected'
              })
            ])
          }
        }
      });
    };

    return {
      sketch: sketch
    };
  }
);
