import { Sketcher, Form, FormField, Behaviour, Input, Invalidating, AlloyEvents, AlloyTriggers, Representing, AddEventsBehaviour } from "ephox/alloy/api/Main";
import { Option, Result, Future, Id, Cell, Arr, Fun } from "@ephox/katamari";
import { Css, Element } from "@ephox/sugar";

import { RgbColour } from '@ephox/acid';

const validInput = Id.generate('valid-input');
const invalidInput = Id.generate('invalid-input');
const validatingInput = Id.generate('validating-input');

const renderTextField = (label: string, isValid: (value: string) => boolean) => {
  const pLabel = FormField.parts().label({
    dom: { tag: 'label', innerHtml: label }
  });

  const pField = FormField.parts().field({
    factory: Input,
    inputBehaviours: Behaviour.derive([
      invalidation(label, isValid)
    ]),
    onSetValue: (input) => {
      if (Invalidating.isInvalid(input)) {
        const run = Invalidating.run(input);
        run.get(Fun.noop)
      }
    }
  });

  return {
    dom: {
      tag: 'div'
    },
    components: [
      pLabel,
      pField
    ]
  };
}

const renderRed = () => {
  return FormField.sketch(
    renderTextField('red', isRgb)
  )
};

const renderBlue = () => {
  return FormField.sketch(
    renderTextField('blue', isRgb)
  )
};

const renderGreen = () => {
  return FormField.sketch(
    renderTextField('green', isRgb)
  )
};

const renderHex = () => {
  return FormField.sketch(
    renderTextField('hex', isHex)
  )
};

const isRgb = (value: string): boolean => {
  const num = parseInt(value, 10);
  return num.toString() === value && num >= 0 && num <= 255;
}

const isHex = (value: string): boolean => {
  const hex = '#' + value;
  const span = Element.fromTag('span');
  Css.set(span, 'background-color', hex);
  return Css.getRaw(span, 'background-color').isSome();
}

// Temporarily using: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
const convertHexToRgb = (hex) => {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
  } : null;
}

// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
const convertRgbToHex = (rgb) => {
  function toHex(c) {
    var hex = c.toString(16);
    console.log('c', c, 'hex', hex);
    return hex.length == 1 ? "0" + hex : hex;
  }

  return toHex(rgb.red) + toHex(rgb.green) + toHex(rgb.blue);
}

const factory = () => {
  const state = {
    red: Cell(Option.none()),
    green: Cell(Option.none()),
    blue: Cell(Option.none())
  };

  const copyHexToRgb = (form, value) => {
    var rgb = convertHexToRgb(value);
    // Groan.
    if (rgb !== null) {
      Representing.setValue(form, {
        red: rgb.r,
        green: rgb.g,
        blue: rgb.b
      })
    }
  }

  const copyRgbToHex = (form, rgb) => {
    const hex = convertRgbToHex(rgb);
    console.log('rgb', rgb, 'hex', hex);
    Representing.setValue(form, {
      hex: hex
    });
  }

  const getValueRgb = () => {
    // Generalise
    return state.red.get().bind(
      (red) => state.green.get().bind(
        (green) => state.blue.get().map(
          (blue) => {
            return { red, green, blue }
          }
        )
      )
    );
  }

  const onInvalidInput = (form, simulatedEvent) => {
    const data = simulatedEvent.event();
    if (data.type() !== 'hex') {
      state[data.type()].set(Option.none());
    }
  }

  const onValidInput = (form, simulatedEvent) => {
    const data = simulatedEvent.event();
    console.log('here', data);
    if (data.type() === 'hex') {
      copyHexToRgb(form, data.value());
    } else {
      const value = parseInt(data.value(), 10);
      state[data.type()].set(Option.some(value));
      getValueRgb().each((rgb) => copyRgbToHex(form, rgb))
    }
  }

  return Form.sketch((parts) => {
    return {
      dom: {
        tag: 'div',
        classes: [ 'rgb-form' ]
      },
      components: [
        parts.field('red', renderRed()),
        parts.field('blue', renderBlue()),
        parts.field('green', renderGreen()),
        parts.field('hex', renderHex())
      ],

      formBehaviours: Behaviour.derive([
        Invalidating.config({
          invalidClass: 'form-invalid'
        }),

        AddEventsBehaviour.config('rgb-form-events', [
          AlloyEvents.run(validInput, onValidInput),
          AlloyEvents.run(invalidInput, onInvalidInput),
          AlloyEvents.run(validatingInput, onInvalidInput)
        ])
      ])
    };
  })
}

const invalidation = (label: string, isValid: (value: string) => boolean) => {
  return Invalidating.config({
    invalidClass: 'not-a-valid-value',

    notify: {
      onValidate: (comp) => {
        AlloyTriggers.emitWith(comp, validatingInput, {
          type: label
        });
      },
      onValid: (comp) => {
        AlloyTriggers.emitWith(comp, validInput, {
          type: label,
          value: Representing.getValue(comp)
        })
      },

      onInvalid: (comp) => {
        AlloyTriggers.emitWith(comp, invalidInput, {
          type: label,
          value: Representing.getValue(comp)
        })
      }
    },

    validator: {
      validate: function (comp) {
        const value = Representing.getValue(comp);
        const res = isValid(value) ? Result.value(true) : Result.error('Invalid value')
        return Future.pure(res);
      }
    }
  });
};

const RgbForm = Sketcher.single({
  factory: factory,
  name: 'RgbForm',
  configFields: [ ],
  apis: { },
  extraApis: { }
});

export {
  RgbForm
}

// const hexToRgbFields = function (hexInput) {
//   const formOpt = memForm.getOpt(hexInput);
//   var hexValue = Representing.getValue(hexInput);
//   formOpt.each((form) => {
//     Representing.setValue(form, {
//       green: 'green set to hex: ' + hexValue
//     })
//   });
// }

// const getFormField = function (anyInSystem, part) {
//   return memForm.getOpt(anyInSystem).bind(function (form) {
//     return Form.getField(form, part);
//   })
// }

// var memForm = Memento.record(
//   Form.sketch((parts) => {
//     return {
//       uid: spec.uid,
//       dom: spec.dom,
//       components: [
//         parts.field('red', FormField.sketch(renderRawInput({ label: 'red' }, form2Form('hex', rgbToHex) ))),
//         parts.field('green', FormField.sketch(renderRawInput({ label: 'green' }, form2Form('hex', rgbToHex) ))),
//         parts.field('blue', FormField.sketch(renderRawInput({ label: 'blue' }, form2Form('hex', rgbToHex) ))),
//         parts.field('hex', FormField.sketch(renderRawInput({ label: 'hex' }, hexToRgbFields ))),
//         parts.field('hue', hue),
//         parts.field('picker', picker)
//       ],

//       formBehaviours: Behaviour.derive([
//         Keying.config({
//           mode: 'cyclic'
//         })
//       ])
//     };
//   })
// );
