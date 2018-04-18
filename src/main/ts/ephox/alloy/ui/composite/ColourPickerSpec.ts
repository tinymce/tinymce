import * as Memento from 'ephox/alloy/api/component/Memento';
import { Form } from 'ephox/alloy/api/ui/Form';
import { FormField } from 'ephox/alloy/api/ui/FormField';
import { Input } from 'ephox/alloy/api/ui/Input';

import { Slider } from 'ephox/alloy/api/ui/Slider';

const make = function (detail, components, spec, externals) {

  var renderRawInput = function (spec) {
    var pLabel = FormField.parts().label({
      dom: { tag: 'label', innerHtml: spec.label }
    });
  
    var pField = FormField.parts().field({
      factory: Input,
      // inputBehaviours: Behaviour.derive([
      //   Tabstopping.config({ })
      // ])
    });
  
    return {
      dom: {
        tag: 'div',
        classes: [ 'example-field-container' ]
      },
      components: [
        pLabel,
        pField
      ]
    };
  };

  const stops = '#ff0000,#ff0080,#ff00ff,#8000ff,#0000ff,#0080ff,#00ffff,#00ff80,#00ff00,#80ff00,#ffff00,#ff8000,#ff0000';
  const gradientCssText = (
    'background: -ms-linear-gradient(right,' + stops + ');' +
    'background: linear-gradient(to right,' + stops + ');'
  );

  var spectrum = Slider.parts().spectrum({
    dom: {
      tag: 'div',
      attributes: {
        title: 'spectrum',
        style: gradientCssText
      },
      classes: [ 'example-slider-spectrum' ]
    }
  });

  var thumb = Slider.parts().thumb({
    dom: {
      tag: 'div',
      innerHtml: 'Thumb',
      attributes: {
        title: 'thumb'
      },
      classes: [ 'example-slider-thumb' ]
    }
  });


  var hue = Slider.sketch({
    dom: {
      tag: 'div',
      attributes: {
        title: 'slider'
      },
      classes: [ 'example-slider' ]
    },
    components: [
      spectrum,
      thumb
    ],
    min: 0,
    max: 100,
    getInitialValue: function () { return 10; }
  });



  var memForm = Memento.record(
    Form.sketch((parts) => {
      return {
        dom: {
          tag: 'div',
          classes: [ 'colour-picker-body' ]
        },
        components: [
          parts.field('green', FormField.sketch(renderRawInput({ label: 'green' }))),
          hue
        ]
      };
    })
  );

  // Making this a simple spec and then we'll introduce where they put the body

  return {
    uid: detail.uid(),
    dom: detail.dom(),
    // components
    components: [
      memForm.asSpec()
    ]
  };
};

export {
  make
};