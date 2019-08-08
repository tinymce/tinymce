import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloyTriggers, Behaviour,
  EventFormat, Focusing, Form, FormField, FormTypes, Input, Invalidating, Memento,
  Representing, SimulatedEvent, Sketcher, SketchSpec, Tabstopping, UiSketcher
} from '@ephox/alloy';
import { Cell, Fun, Future, Id, Merger, Option, Result } from '@ephox/katamari';
import { Css } from '@ephox/sugar';
import { Hex, Rgba } from '../../api/colour/ColourTypes';
import * as HexColour from '../../api/colour/HexColour';
import * as RgbaColour from '../../api/colour/RgbaColour';
import * as ColourEvents from '../ColourEvents';

const validInput = Id.generate('valid-input');
const invalidInput = Id.generate('invalid-input');
const validatingInput = Id.generate('validating-input');

interface HexInputEvent extends EventFormat {
  type: () => 'hex';
  value: () => string;
}

interface ColorInputEvent extends EventFormat {
  type: () => 'red' | 'green' | 'blue';
  value: () => string;
}

type InputEvent = HexInputEvent | ColorInputEvent;

const translatePrefix = 'colorcustom.rgb.';

// tslint:disable:no-empty-interface
export interface RgbFormDetail extends Sketcher.SingleSketchDetail {
}

export interface RgbFormSpec extends Sketcher.SingleSketchSpec {
}
// tslint:enable:no-empty-interface

export interface RgbFormSketcher extends Sketcher.SingleSketch<RgbFormSpec, RgbFormDetail> {
  updateHex: (slider: AlloyComponent, colour: Hex) => void;
}

const rgbFormFactory = (translate: (key: string) => string, getClass: (key: string) => string, onValidHexx: (component: AlloyComponent) => void, onInvalidHexx: (component: AlloyComponent) => void) => {
  const invalidation = (label: string, isValid: (value: string) => boolean) => {
    return Invalidating.config({
      invalidClass: getClass('invalid'),

      notify: {
        onValidate: (comp: AlloyComponent) => {
          AlloyTriggers.emitWith(comp, validatingInput, {
            type: label
          });
        },
        onValid: (comp: AlloyComponent) => {
          AlloyTriggers.emitWith(comp, validInput, {
            type: label,
            value: Representing.getValue(comp)
          });
        },

        onInvalid: (comp: AlloyComponent) => {
          AlloyTriggers.emitWith(comp, invalidInput, {
            type: label,
            value: Representing.getValue(comp)
          });
        }
      },

      validator: {
        validate: (comp: AlloyComponent) => {
          const value = Representing.getValue(comp);
          const res = isValid(value) ? Result.value(true) : Result.error(translate('aria.input.invalid'));
          return Future.pure(res);
        },
        validateOnLoad: false
      }
    });
  };

  const renderTextField = (isValid: (value: string) => boolean, name: string, label: string, description: string, data: string | number) => {
    const helptext = translate(translatePrefix + 'range');

    const pLabel = FormField.parts().label({
      dom: { tag: 'label', innerHtml: label, attributes: { 'aria-label': description } }
    });

    const pField = FormField.parts().field({
      data,
      factory: Input,
      inputAttributes: {
        type: 'text',
        ...name === 'hex' ? { 'aria-live': 'polite' } : {}
      },
      inputClasses: [getClass('textfield')],

      // Have basic invalidating and tabstopping behaviour.
      inputBehaviours: Behaviour.derive([
        invalidation(name, isValid),
        Tabstopping.config({})
      ]),

      // If it was invalid, and the value was set, run validation against it.
      onSetValue: (input: AlloyComponent) => {
        if (Invalidating.isInvalid(input)) {
          const run = Invalidating.run(input);
          run.get(Fun.noop);
        }
      }
    });

    const comps = [pLabel, pField];
    const concats = name !== 'hex' ? [FormField.parts()['aria-descriptor']({
      text: helptext
    })] : [];
    const components = comps.concat(concats);

    return {
      dom: {
        tag: 'div',
        attributes: {
          role: 'presentation'
        }
      },
      components
    };
  };

  const copyRgbToHex = (form: AlloyComponent, rgba: Rgba) => {
    const hex = HexColour.fromRgba(rgba);
    Form.getField(form, 'hex').each((hexField: AlloyComponent) => {
      // Not amazing, but it turns out that if we have an invalid RGB field, and no hex code
      // and then type in a valid three digit hex code, the RGB field will be overriden, then validate and then set
      // the hex field to be the six digit version of that same three digit hex code. This is incorrect.
      if (!Focusing.isFocused(hexField)) {
        Representing.setValue(form, {
          hex: hex.value()
        });
      }
    });
    return hex;
  };

  const copyRgbToForm = (form: AlloyComponent, rgb: Rgba): void => {
    const red = rgb.red(); const green = rgb.green(); const blue = rgb.blue();
    Representing.setValue(form, { red, green, blue });
  };

  const memPreview = Memento.record(
    {
      dom: {
        tag: 'div',
        classes: [getClass('rgba-preview')],
        styles: {
          'background-color': 'white'
        },
        attributes: {
          role: 'presentation'
        }
      }
    }
  );

  const updatePreview = (anyInSystem: AlloyComponent, hex: Hex) => {
    memPreview.getOpt(anyInSystem).each((preview: AlloyComponent) => {
      Css.set(preview.element(), 'background-color', '#' + hex.value());
    });
  };

  const factory: UiSketcher.SingleSketchFactory<RgbFormDetail, RgbFormSpec> = (): SketchSpec => {
    const state = {
      red: Fun.constant(Cell(Option.some(255))),
      green: Fun.constant(Cell(Option.some(255))),
      blue: Fun.constant(Cell(Option.some(255))),
      hex: Fun.constant(Cell(Option.some('ffffff')))
    };

    const copyHexToRgb = (form: AlloyComponent, hex: Hex) => {
      const rgb = RgbaColour.fromHex(hex);
      copyRgbToForm(form, rgb);
      setValueRgb(rgb);
    };

    const get = (prop: keyof typeof state): Option<any> => {
      return state[prop]().get();
    };

    const set = (prop: keyof typeof state, value: Option<any>): void => {
      state[prop]().set(value);
    };

    const getValueRgb = () => {
      return get('red').bind(
        (red) => get('green').bind(
          (green) => get('blue').map(
            (blue) => {
              return RgbaColour.rgbaColour(red, green, blue, 1);
            }
          )
        )
      );
    };

    // TODO: Find way to use this for palette and slider updates
    const setValueRgb = (rgb: Rgba): void => {
      const red = rgb.red(); const green = rgb.green(); const blue = rgb.blue();
      set('red', Option.some(red));
      set('green', Option.some(green));
      set('blue', Option.some(blue));
    };

    const onInvalidInput = (form: AlloyComponent, simulatedEvent: SimulatedEvent<InputEvent>) => {
      const data = simulatedEvent.event();
      if (data.type() !== 'hex') {
        set(data.type(), Option.none());
      } else {
        onInvalidHexx(form);
      }
    };

    const onValidHex = (form: AlloyComponent, value: string) => {
      onValidHexx(form);
      const hex = HexColour.hexColour(value);
      set('hex', Option.some(value));

      const rgb = RgbaColour.fromHex(hex);
      copyRgbToForm(form, rgb);
      setValueRgb(rgb);

      AlloyTriggers.emitWith(form, ColourEvents.fieldsUpdate(), {
        hex
      });

      updatePreview(form, hex);
    };

    const onValidRgb = (form: AlloyComponent, prop: 'red' | 'green' | 'blue', value: string) => {
      const val = parseInt(value, 10);
      set(prop, Option.some(val));
      getValueRgb().each((rgb) => {
        const hex = copyRgbToHex(form, rgb);
        updatePreview(form, hex);
      });
    };

    const isHexInputEvent = (data: InputEvent): data is HexInputEvent => {
      return data.type() === 'hex';
    };

    const onValidInput = (form: AlloyComponent, simulatedEvent: SimulatedEvent<InputEvent>) => {
      const data = simulatedEvent.event();
      if (isHexInputEvent(data)) {
        onValidHex(form, data.value());
      } else {
        onValidRgb(form, data.type(), data.value());
      }
    };

    const formPartStrings = (key: string) => {
      return {
        label: translate(translatePrefix + key + '.label'),
        description: translate(translatePrefix + key + '.description')
      };
    };

    const redStrings = formPartStrings('red');
    const greenStrings = formPartStrings('green');
    const blueStrings = formPartStrings('blue');
    const hexStrings = formPartStrings('hex');

    // TODO: Provide a nice way of adding APIs to existing sketchers
    return Merger.deepMerge(
      Form.sketch((parts: FormTypes.FormParts) => {
        return {
          dom: {
            tag: 'form',
            classes: [getClass('rgb-form')],
            attributes: { 'aria-label': translate('aria.color.picker') }
          },
          components: [
            parts.field('red', FormField.sketch(renderTextField(RgbaColour.isRgbaComponent, 'red', redStrings.label, redStrings.description, 255))),
            parts.field('green', FormField.sketch(renderTextField(RgbaColour.isRgbaComponent, 'green', greenStrings.label, greenStrings.description, 255))),
            parts.field('blue', FormField.sketch(renderTextField(RgbaColour.isRgbaComponent, 'blue', blueStrings.label, blueStrings.description, 255))),
            parts.field('hex', FormField.sketch(renderTextField(HexColour.isHexString, 'hex', hexStrings.label, hexStrings.description, 'ffffff'))),
            memPreview.asSpec()
          ],

          formBehaviours: Behaviour.derive([
            Invalidating.config({
              invalidClass: getClass('form-invalid')
            }),

            AddEventsBehaviour.config('rgb-form-events', [
              AlloyEvents.run(validInput, onValidInput),
              AlloyEvents.run(invalidInput, onInvalidInput),
              AlloyEvents.run(validatingInput, onInvalidInput)
            ])
          ])
        };
      }),
      {
        apis: {
          updateHex(form: AlloyComponent, hex: Hex) {
            Representing.setValue(form, {
              hex: hex.value()
            });
            copyHexToRgb(form, hex);
            updatePreview(form, hex);
          }
        }
      }
    );
  };

  interface Apis {
    updateHex(form: AlloyComponent, hex: Hex): void;
  }

  const rgbFormSketcher = Sketcher.single({
    factory,
    name: 'RgbForm',
    configFields: [],
    apis: {
      updateHex(apis: Apis, form: AlloyComponent, hex: Hex) {
        apis.updateHex(form, hex);
      }
    },
    extraApis: {}
  }) as RgbFormSketcher;

  return rgbFormSketcher;
};

export default {
  rgbFormFactory
};
