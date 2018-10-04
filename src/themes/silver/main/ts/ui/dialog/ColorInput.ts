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
  Tabstopping,
  Focusing,
  Layout,
} from '@ephox/alloy';
import { Types } from '@ephox/bridge';
import { Future, Id, Result, Option, Cell } from '@ephox/katamari';
import { Css, Element, Traverse } from '@ephox/sugar';

import { UiFactoryBackstageShared } from '../../backstage/Backstage';
import { renderPanelButton } from '../general/PanelButton';
import { renderLabel } from '../alien/FieldLabeller';
import { UiFactoryBackstageForColorInput } from '../../backstage/ColorInputBackstage';

import { SingleMenuItemApi } from '../menus/menu/SingleMenu';

const colorInputChangeEvent = Id.generate('color-change');
const colorSwatchChangeEvent = Id.generate('hex-change');

interface ColorInputChangeEvent extends CustomEvent {
  color: () => string;
}

interface ColorSwatchChangeEvent extends CustomEvent {
  value: () => string;
}

const currentColors: Cell<SingleMenuItemApi[]> = Cell<SingleMenuItemApi[]>(
  [
    { type: 'choiceitem', text: 'Black', value: '#1abc9c' },
    { type: 'choiceitem', text: 'Black', value: '#2ecc71' },
    { type: 'choiceitem', text: 'Black', value: '#3498db' },
    { type: 'choiceitem', text: 'Black', value: '#9b59b6' },
    { type: 'choiceitem', text: 'Black', value: '#34495e' },

    { type: 'choiceitem', text: 'Black', value: '#16a085' },
    { type: 'choiceitem', text: 'Black', value: '#27ae60' },
    { type: 'choiceitem', text: 'Black', value: '#2980b9' },
    { type: 'choiceitem', text: 'Black', value: '#8e44ad' },
    { type: 'choiceitem', text: 'Black', value: '#2c3e50' },

    { type: 'choiceitem', text: 'Black', value: '#f1c40f' },
    { type: 'choiceitem', text: 'Black', value: '#e67e22' },
    { type: 'choiceitem', text: 'Black', value: '#e74c3c' },
    { type: 'choiceitem', text: 'Black', value: '#ecf0f1' },
    { type: 'choiceitem', text: 'Black', value: '#95a5a6' },

    { type: 'choiceitem', text: 'Black', value: '#f39c12' },
    { type: 'choiceitem', text: 'Black', value: '#d35400' },
    { type: 'choiceitem', text: 'Black', value: '#c0392b' },
    { type: 'choiceitem', text: 'Black', value: '#bdc3c7' },
    { type: 'choiceitem', text: 'Black', value: '#7f8c8d' },

    { type: 'choiceitem', text: 'Black', value: '#000000' },
    { type: 'choiceitem', text: 'Black', value: '#ffffff' }
  ]
);

export const renderColorInput = (spec: Types.ColorInput.ColorInput, sharedBackstage: UiFactoryBackstageShared, colorInputBackstage: UiFactoryBackstageForColorInput): SimpleSpec => {
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

  const emitSwatchChange = (colorBit, value) => {
    AlloyTriggers.emitWith(colorBit, colorSwatchChangeEvent, {
      value
    });
  };

  const onItemAction = (value) => {
    sharedBackstage.getSink().each((sink) => {
      memColorButton.getOpt(sink).each((colorBit) => {
        if (value === 'custom') {
          colorInputBackstage.colorPicker((value) => {
            emitSwatchChange(colorBit, value);
            currentColors.set(currentColors.get().concat([
              {
                type: 'choiceitem',
                text: value,
                value
              }
            ]));
          }, '#ffffff');
        } else if (value === 'remove') {
          emitSwatchChange(colorBit, '');
        } else {
          emitSwatchChange(colorBit, value);
        }
      });
    });
  };

  const memColorButton = Memento.record(
    renderPanelButton({
      dom: {
        tag: 'span'
      },
      layouts: Option.some({
        onRtl: () => [ Layout.southeast ],
        onLtr: () => [ Layout.southwest ]
      }),
      components: [],
      fetch: (callback) => {
        callback(
          currentColors.get().concat([{
            type: 'choiceitem',
            text: 'Remove',
            value: 'remove'
          },
          {
            type: 'choiceitem',
            text: 'Custom',
            value: 'custom'
          }])
        );
      },
      onItemAction,
      items: []
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
        AlloyEvents.run<ColorInputChangeEvent>(colorInputChangeEvent, (comp, se) => {
          memColorButton.getOpt(comp).each((colorButton) => {
            Css.set(colorButton.element(), 'background-color', se.event().color());
          });
        }),
        AlloyEvents.run<ColorSwatchChangeEvent>(colorSwatchChangeEvent, (comp, se) => {
          FormField.getField(comp).each((field) => {
            Representing.setValue(field, se.event().value());
            // Focus the field now that we've set its value
            Composing.getCurrent(comp).each(Focusing.focus);
          });
        })
      ])
    ])
  });
};