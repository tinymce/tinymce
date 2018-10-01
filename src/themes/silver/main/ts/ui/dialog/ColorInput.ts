import {
  AddEventsBehaviour,
  AlloyEvents,
  AlloyTriggers,
  Behaviour,
  CustomEvent,
  FormField,
  Input,
  Invalidating,
  Memento,
  Representing,
  SimpleSpec,
  AlloySpec,
  Keying,
  Composing,
  Disabling,
  SystemEvents,
  Tabstopping,
  Focusing,
} from '@ephox/alloy';
import { Types } from '@ephox/bridge';
import { Future, Id, Result, Option } from '@ephox/katamari';
import { Css, Element, Traverse } from '@ephox/sugar';

import { UiFactoryBackstageShared } from '../../backstage/Backstage';
import { renderPanelButton } from '../general/PanelButton';
import { renderColorPicker } from './ColorPicker';
import { renderLabel } from '../alien/FieldLabeller';
import { renderButton } from '../general/Button';

const colorChangeEvent = Id.generate('color-change');
const hexChangeEvent = Id.generate('hex-change');

interface ColorChangeEvent extends CustomEvent {
  color: () => string;
}

interface HexChangeEvent extends CustomEvent {
  hex: () => string;
}

export const renderColorInput = (spec: Types.ColorInput.ColorInput, sharedBackstage: UiFactoryBackstageShared): SimpleSpec => {
  const pField = FormField.parts().field({
    factory: Input,
    inputClasses: ['tox-textfield'],

    onSetValue: (c) => Invalidating.run(c).get(() => { }),

    inputBehaviours: Behaviour.derive([
      Tabstopping.config({ }),
      Invalidating.config({
        invalidClass: 'tox-textbox-field-invalid',
        getRoot: (comp) => {
          return Traverse.parent(comp.element());
        },
        notify: {
          onValid: (comp) => {
            // onValid should pass through the value here
            // We need a snapshot of the value validated.
            const val = Representing.getValue(comp);
            AlloyTriggers.emitWith(comp, colorChangeEvent, {
              color: val
            });
          }
        },
        validator: {
          validateOnLoad: false,
          validate: (input) => {
            const inputValue = Representing.getValue(input);
            // Consider empty strings valid colours
            if (inputValue.length === 0) {
              return Future.pure(Result.value(true));
            } else {
              const span = Element.fromTag('span');
              Css.set(span, 'background-color', inputValue);

              const res = Css.getRaw(span, 'background-color').fold(
                // TODO: Work out what we want to do here.
                () => Result.error('blah'),
                (_) => Result.value(inputValue)
              );

              return Future.pure(res);
            }
          }
        }
      })
    ])
  });

  const pLabel: Option<AlloySpec> = spec.label.map(renderLabel);

  const memColorPicker = Memento.record(
    renderColorPicker({
      type: 'colorpicker',
      name: spec.name + '-picker',
      label: Option.none(),
      colspan: Option.none()
    })
  );

  const memSubmitButton = Memento.record(
    renderButton({
      name: 'ok',
      text: 'Ok',
      primary: true,
      disabled: false
    }, (api) => {
      memColorPicker.getOpt(api).fold(() => {
        console.error('could not find color picker');
      },
        (picker) => {
          Composing.getCurrent(picker).each((pickerForm) => {
            const hex = Representing.getValue(pickerForm);
            memColorButton.getOpt(pickerForm).each((colorBit) => {
              AlloyTriggers.emitWith(colorBit, hexChangeEvent, {
                hex
              });
            });
            AlloyTriggers.emit(api, SystemEvents.sandboxClose());
          });
        });
    })
  );

  const onChange = (item, details) => {
    if (details.event().name() === 'hex-valid') {
      memSubmitButton.getOpt(item).each((button) => {
        if (details.event().value()) {
          Disabling.enable(button);
        } else {
          Disabling.disable(button);
        }
      });
    }
  };

  const memColorButton = Memento.record(
    renderPanelButton({
      dom: {
        tag: 'span'
      },
      getHotspot: (button) => {
        const prevSibling = Traverse.prevSibling(button.element());
        return prevSibling.bind((s) => {
          return button.getSystem().getByDom(s).toOption();
        });
      },
      components: [],
      fetch: ((callback) => {
        callback({
          dom: {
            tag: 'div'
          },
          components: [
            memColorPicker.asSpec(),
            memSubmitButton.asSpec()
          ],
          behaviours: Behaviour.derive([
            Keying.config({
              mode: 'cyclic'
            }),

            AddEventsBehaviour.config('redirect-enter-to-submit', [
              AlloyEvents.runOnExecute((comp, se) => {
                // If the submit button isn't disabled, redirect pressing <enter>
                // on an input to the submit button
                memSubmitButton.getOpt(comp).each((submit) => {
                  // NOTE: Disabling makes components ignore execute if disabled
                  AlloyTriggers.emitExecute(submit);
                  // We want to stop the execute regardless of whether the button is disabled.
                  se.stop();
                });
              })
            ])
          ])
        });
      }),
      onChange
    }, sharedBackstage)
  );

  return FormField.sketch({
    dom: {
      tag: 'div',
      classes: ['tox-form__group']
    },
    components: pLabel.toArray().concat([
      {
        dom: {
          tag: 'div',
          classes: ['tox-color-input']
        },
        components: [
          pField,
          memColorButton.asSpec()
        ]
      }
    ]),

    fieldBehaviours: Behaviour.derive([
      AddEventsBehaviour.config('form-field-events', [
        AlloyEvents.run<ColorChangeEvent>(colorChangeEvent, (comp, se) => {
          memColorButton.getOpt(comp).each((colorButton) => {
            Css.set(colorButton.element(), 'background-color', se.event().color());
          });
        }),
        AlloyEvents.run<HexChangeEvent>(hexChangeEvent, (comp, se) => {
          FormField.getField(comp).each((field) => {
            Representing.setValue(field, se.event().hex());
            // Focus the field now that we've set its value
            Composing.getCurrent(comp).each(Focusing.focus);
          });
        })
      ])
    ])
  });
};