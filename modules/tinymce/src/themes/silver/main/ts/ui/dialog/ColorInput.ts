import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloySpec, AlloyTriggers, Behaviour, Composing, CustomEvent, Disabling, Focusing, FormField, Input,
  Invalidating, Layout, Memento, Representing, SimpleSpec, Tabstopping
} from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Fun, Future, Id, Optional, Result } from '@ephox/katamari';
import { Css, SugarElement, Traverse } from '@ephox/sugar';

import { UiFactoryBackstageShared } from '../../backstage/Backstage';
import { UiFactoryBackstageForColorInput } from '../../backstage/ColorInputBackstage';
import * as ReadOnly from '../../ReadOnly';
import { renderLabel } from '../alien/FieldLabeller';
import * as ColorCache from '../core/color/ColorCache';
import * as ColorSwatch from '../core/color/ColorSwatch';
import { formChangeEvent } from '../general/FormEvents';
import { renderPanelButton } from '../general/PanelButton';

const colorInputChangeEvent = Id.generate('color-input-change');
const colorSwatchChangeEvent = Id.generate('color-swatch-change');
const colorPickerCancelEvent = Id.generate('color-picker-cancel');

interface ColorInputChangeEvent extends CustomEvent {
  readonly color: string;
}

interface ColorSwatchChangeEvent extends CustomEvent {
  readonly value: string;
}

interface ColorPickerCancelEvent extends CustomEvent {
  readonly value: string;
}

type ColorInputSpec = Omit<Dialog.ColorInput, 'type'>;

export const renderColorInput = (
  spec: ColorInputSpec,
  sharedBackstage: UiFactoryBackstageShared,
  colorInputBackstage: UiFactoryBackstageForColorInput,
  initialData: Optional<string>
): SimpleSpec => {
  const pField = FormField.parts.field({
    factory: Input,
    inputClasses: [ 'tox-textfield' ],
    data: initialData,

    onSetValue: (c: AlloyComponent) => Invalidating.run(c).get(Fun.noop),

    inputBehaviours: Behaviour.derive([
      Disabling.config({
        disabled: sharedBackstage.providers.isDisabled
      }),
      ReadOnly.receivingConfig(),
      Tabstopping.config({ }),
      Invalidating.config({
        invalidClass: 'tox-textbox-field-invalid',
        getRoot: (comp) => Traverse.parentElement(comp.element),
        notify: {
          onValid: (comp) => {
            // onValid should pass through the value here
            // We need a snapshot of the value validated.
            const val = Representing.getValue(comp);
            AlloyTriggers.emitWith(comp, colorInputChangeEvent, {
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
              const span = SugarElement.fromTag('span');
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
    ]),
    selectOnFocus: false
  });

  const pLabel: Optional<AlloySpec> = spec.label.map((label) => renderLabel(label, sharedBackstage.providers));

  const emitSwatchChange = (colorBit: AlloyComponent, value: string) => {
    AlloyTriggers.emitWith(colorBit, colorSwatchChangeEvent, {
      value
    });
  };

  const onItemAction = (comp: AlloyComponent, value: string) => {
    memColorButton.getOpt(comp).each((colorBit) => {
      if (value === 'custom') {
        colorInputBackstage.colorPicker((valueOpt) => {
          valueOpt.fold(
            () => AlloyTriggers.emit(colorBit, colorPickerCancelEvent),
            (value) => {
              emitSwatchChange(colorBit, value);
              ColorCache.addColor(spec.storageKey, value);
            }
          );
        }, '#ffffff');
      } else if (value === 'remove') {
        emitSwatchChange(colorBit, '');
      } else {
        emitSwatchChange(colorBit, value);
      }
    });
  };

  const memColorButton = Memento.record(
    renderPanelButton({
      dom: {
        tag: 'span',
        attributes: {
          'aria-label': sharedBackstage.providers.translate('Color swatch')
        }
      },
      layouts: {
        onRtl: () => [ Layout.southwest, Layout.southeast, Layout.south ],
        onLtr: () => [ Layout.southeast, Layout.southwest, Layout.south ]
      },
      components: [],
      fetch: ColorSwatch.getFetch(colorInputBackstage.getColors(spec.storageKey), spec.storageKey, colorInputBackstage.hasCustomColors()),
      columns: colorInputBackstage.getColorCols(spec.storageKey),
      presets: 'color',
      onItemAction
    }, sharedBackstage)
  );

  return FormField.sketch({
    dom: {
      tag: 'div',
      classes: [ 'tox-form__group' ]
    },
    components: pLabel.toArray().concat([
      {
        dom: {
          tag: 'div',
          classes: [ 'tox-color-input' ]
        },
        components: [
          pField,
          memColorButton.asSpec()
        ]
      }
    ]),

    fieldBehaviours: Behaviour.derive([
      AddEventsBehaviour.config('form-field-events', [
        AlloyEvents.run<ColorInputChangeEvent>(colorInputChangeEvent, (comp, se) => {
          memColorButton.getOpt(comp).each((colorButton) => {
            Css.set(colorButton.element, 'background-color', se.event.color);
          });
          AlloyTriggers.emitWith(comp, formChangeEvent, { name: spec.name } );
        }),
        AlloyEvents.run<ColorSwatchChangeEvent>(colorSwatchChangeEvent, (comp, se) => {
          FormField.getField(comp).each((field) => {
            Representing.setValue(field, se.event.value);
            // Focus the field now that we've set its value
            Composing.getCurrent(comp).each(Focusing.focus);
          });
        }),
        AlloyEvents.run<ColorPickerCancelEvent>(colorPickerCancelEvent, (comp, _se) => {
          FormField.getField(comp).each((_field) => {
            Composing.getCurrent(comp).each(Focusing.focus);
          });
        })
      ])
    ])
  });
};
