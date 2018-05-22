import { Sketcher, Form, FormField, Behaviour, Input, Invalidating, AlloyEvents, AlloyTriggers, Representing, AddEventsBehaviour, Tabstopping } from "ephox/alloy/api/Main";
import { Option, Result, Future, Id, Cell, Arr, Fun } from "@ephox/katamari";
import { Css, Element } from "@ephox/sugar";

import { RgbColour } from '@ephox/acid';

import { isHex, isRgb, convertHexToRgb, convertRgbToHex } from './ColourChanges';

const validInput = Id.generate('valid-input');
const invalidInput = Id.generate('invalid-input');
const validatingInput = Id.generate('validating-input');

const renderTextField = (label: string, isValid: (value: string) => boolean) => {
  const pLabel = FormField.parts().label({
    dom: { tag: 'label', innerHtml: label }
  });

  const pField = FormField.parts().field({
    factory: Input,

    // Have basic invalidating and tabstopping behaviour.
    inputBehaviours: Behaviour.derive([
      invalidation(label, isValid),
      Tabstopping.config({ })
    ]),

    // If it was invalid, and the value was set, run validation against it.
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
        parts.field('red', FormField.sketch(renderTextField('red', isRgb))),
        parts.field('blue', FormField.sketch(renderTextField('blue', isRgb))),
        parts.field('green', FormField.sketch(renderTextField('green', isRgb))),
        parts.field('hex', FormField.sketch(renderTextField('hex', isHex)))
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
