import { DslType } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { FormField } from '../../api/ui/FormField';
import { Slider } from '../../api/ui/Slider';
import * as PartType from '../../parts/PartType';

import * as Memento from 'ephox/alloy/api/component/Memento';
import { Form } from 'ephox/alloy/api/ui/Form';
import { Input } from 'ephox/alloy/api/ui/Input';


import * as Behaviour from '../../api/behaviour/Behaviour';

import { Composing } from '../../api/behaviour/Composing';
import { Tabstopping } from '../../api/behaviour/Tabstopping';

import { Keying } from '../../api/behaviour/Keying';

import { Focusing } from '../../api/behaviour/Focusing';


import { Option } from '@ephox/katamari';

const schema = Fun.constant([
  
]);



var makeMeAForm = {
  sketch: function (spec) {

    var renderRawInput = function (spec) {
      var pLabel = FormField.parts().label({
        dom: { tag: 'label', innerHtml: spec.label }
      });
    
      var pField = FormField.parts().field({
        factory: Input,


        inputBehaviours: Behaviour.derive([
          Tabstopping.config({ })
        ])
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
      getInitialValue: function () { return 10; },
      sliderBehaviours: Behaviour.derive([
        Composing.config({
          find: Option.some
        }),
        Tabstopping.config({ }),
        Focusing.config({ })
      ])
    });
  



    console.log('arguments', arguments, spec);
    return (
      Form.sketch((parts) => {
        return {
          uid: spec.uid,
          dom: spec.dom,
          components: [
            parts.field('green', FormField.sketch(renderRawInput({ label: 'green' }))),
            parts.field('hue', hue)
          ],

          formBehaviours: Behaviour.derive([
            Keying.config({
              mode: 'cyclic'
            })
          ])
        };
      })
    );
  }
};



const parts = Fun.constant([

  // PartType.required({
  //   factory: Slider,
  //   name: 'hue'
  // }),
  // PartType.required({
  //   factory: FormField,
  //   name: 'red'
  // }),
  PartType.required({
    // factory: FormField,
    name: 'body',
    factory: makeMeAForm
  })
  //,
  // PartType.required({
  //   factory: FormField,
  //   name: 'blue'
  // }),
  // PartType.required({
  //   factory: FormField,
  //   name: 'hex'
  // })
]);

const name = Fun.constant('ColourPicker');

export {
  name,
  schema,
  parts
};