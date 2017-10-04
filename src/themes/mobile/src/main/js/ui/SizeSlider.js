define(
  'tinymce.themes.mobile.ui.SizeSlider',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Receiving',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.ui.Slider',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'tinymce.themes.mobile.channels.Receivers',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.util.UiDomFactory'
  ],

  function (Behaviour, Receiving, Toggling, Slider, FieldSchema, ValueSchema, Receivers, Styles, UiDomFactory) {
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

        sliderBehaviours: Behaviour.derive([
          Receivers.orientation(Slider.refresh)
        ]),

        components: [
          Slider.parts().spectrum({
            dom: UiDomFactory.dom('<div class="${prefix}-slider-size-container"></div>'),
            components: [
              UiDomFactory.spec('<div class="${prefix}-slider-size-line"></div>')
            ]
          }),
          
          Slider.parts().thumb({
            dom: UiDomFactory.dom('<div class="${prefix}-slider-thumb"></div>'),
            behaviours: Behaviour.derive([
              Toggling.config({
                toggleClass: Styles.resolve('thumb-active')
              })
            ])
          })
        ]
      });
    };

    return {
      sketch: sketch
    };
  }
);
