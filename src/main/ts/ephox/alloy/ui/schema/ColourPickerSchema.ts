import { DslType } from '@ephox/boulder';
import { Fun, Result,Future } from '@ephox/katamari';
import { FormField } from '../../api/ui/FormField';
import { Slider } from '../../api/ui/Slider';
import { Palette } from '../../api/ui/Palette';
import * as PartType from '../../parts/PartType';

import * as Memento from 'ephox/alloy/api/component/Memento';
import { Form } from 'ephox/alloy/api/ui/Form';
import { Input } from 'ephox/alloy/api/ui/Input';


import * as Behaviour from '../../api/behaviour/Behaviour';

import { Composing } from '../../api/behaviour/Composing';
import { Tabstopping } from '../../api/behaviour/Tabstopping';

import { Keying } from '../../api/behaviour/Keying';

import { Focusing } from '../../api/behaviour/Focusing';

import { Representing } from '../../api/behaviour/Representing';

import { Disabling } from '../../api/behaviour/Disabling';


import { Invalidating } from '../../api/behaviour/Invalidating';

import * as AddEventsBehaviour from '../../api/behaviour/AddEventsBehaviour';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';

import { Objects } from '@ephox/boulder';
import { Option } from '@ephox/katamari';

import { HsvColour, RgbColour } from '@ephox/acid';

var makeMeAForm = {
  sketch: function (spec) {
    var renderRawInput = function (spec, onChange) {
      var pLabel = FormField.parts().label({
        dom: { tag: 'label', innerHtml: spec.label }
      });
    
      var pField = FormField.parts().field({
        factory: Input,
        eventOrder: {
          'input': [ 'alloy-base.behaviour', 'representing', 'streaming', 'invalidating', 'changing-input' ]
        },
        inputBehaviours: Behaviour.derive([
          Tabstopping.config({ }),
          AddEventsBehaviour.config('changing-input', [
            AlloyEvents.run(
              NativeEvents.input(),
              onChange
            )
          ]),

          Invalidating.config({
            invalidClass: 'not-a-valid-value',

            notify: {
              onValid: function (comp) {
                // NOTE: This isn't correct because it will enable the button if one field is made
                // valid while others are still invalid. Just for demonstration purposes.
                comp.getSystem().broadcastOn(
                  [
                    'magic-form-string'
                  ],
                  Objects.wrap(spec.label, true)
                );
                // Disabling.enable(button);
              },

              onInvalid: function (comp) {
                comp.getSystem().broadcastOn(
                  [
                    'magic-form-string'
                  ],
                  Objects.wrap(spec.label, false)
                );
              }
            },

            validator: {
              validate: function (comp) {

                const value = Representing.getValue(comp);
                const num = parseInt(value, 10);
                const res = num.toString() === value && num >= 0 && num <= 255 ? Result.value(true) : Result.error('Invalid value')

                return Future.pure(res);
              }
            }
          })
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

    var palette = Palette.parts().palette({
      dom: {
        tag: 'canvas',
        attributes: {
          title: 'palette'
        },
        classes: [ 'example-palette-palette' ]
      }
    });

    var paletteThumb = Palette.parts().thumb({
      dom: {
        tag: 'div',
        innerHtml: 'Thumb',
        attributes: {
          title: 'thumb'
        },
        classes: [ 'example-slider-thumb' ]
      }
    });

    var picker = Palette.sketch({
      dom: {
        tag: 'div',
        attributes: {
          title: 'picker'
        },
        classes: [ 'example-palette' ]
      },
      components: [
        palette,
        paletteThumb
      ],
      paletteBehaviours: Behaviour.derive([
        Composing.config({
          find: Option.some
        }),
        Tabstopping.config({ }),
        Focusing.config({ })
      ])
    })
  
    const stops = '#ff0000,#ff0080,#ff00ff,#8000ff,#0000ff,#0080ff,#00ffff,#00ff80,#00ff00,#80ff00,#ffff00,#ff8000,#ff0000';
    const gradientCssText = (
      'background: -ms-linear-gradient(bottom,' + stops + ');' +
      'background: linear-gradient(to bottom,' + stops + ');'
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
      orientation: 'vertical',
      getInitialValue: function () { return 10; },
      sliderBehaviours: Behaviour.derive([
        Composing.config({
          find: Option.some
        }),
        Tabstopping.config({ }),
        Focusing.config({ })
      ]),

      onChange: function (slider) {
        const formOpt = memForm.getOpt(slider);
        formOpt.each((form) => {
          Representing.setValue(form, {
            green: Representing.getValue(slider)
          })
          const palette = getFormField(form, 'picker').getOrDie('We should not say this');
          var hue = ((100 - Representing.getValue(slider)) / 100) * 360;
          var hsv = {
            saturation: 100,
            value: 100,
            hue: hue
          };
          var rgb = RgbColour.fromHsv(hsv);
          console.log(rgb);
          Palette.refreshColour(palette, rgb);
        })
      }
    });


    const rgbToHex = function (redValue) {
      return 'rgb made me: ' + redValue;
    };

    const form2Form = function (outPart, f) {
      return (ins) => {
      
        const value = Representing.getValue(ins);
        
        getFormField(ins, outPart).each(function (hex) {
          const hexValue = f(value);
          Representing.setValue(hex, hexValue);
        });
      };
    }

    const hexToRgbFields = function (hexInput) {
      const formOpt = memForm.getOpt(hexInput);
      var hexValue = Representing.getValue(hexInput);
      formOpt.each((form) => {
        Representing.setValue(form, {
          green: 'green set to hex: ' + hexValue
        })
      });
    }

    const getFormField = function (anyInSystem, part) {
      return memForm.getOpt(anyInSystem).bind(function (form) {
        return Form.getField(form, part);
      })
    }

    var memForm = Memento.record(
      Form.sketch((parts) => {
        return {
          uid: spec.uid,
          dom: spec.dom,
          components: [
            parts.field('red', FormField.sketch(renderRawInput({ label: 'red' }, form2Form('hex', rgbToHex) ))),
            parts.field('green', FormField.sketch(renderRawInput({ label: 'green' }, form2Form('hex', rgbToHex) ))),
            parts.field('blue', FormField.sketch(renderRawInput({ label: 'blue' }, form2Form('hex', rgbToHex) ))),
            parts.field('hex', FormField.sketch(renderRawInput({ label: 'hex' }, hexToRgbFields ))),
            parts.field('hue', hue),
            parts.field('picker', picker)
          ],

          formBehaviours: Behaviour.derive([
            Keying.config({
              mode: 'cyclic'
            })
          ])
        };
      })
    );

    return memForm.asSpec();
  }
};



const parts = Fun.constant([
  PartType.required({
    name: 'body',
    factory: makeMeAForm
  })
]);

const schema = Fun.constant([]);

const name = Fun.constant('ColourPicker');

export {
  name,
  schema,
  parts
};