import { AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloySpec, Behaviour, Button, Focusing, GuiFactory, Input, Keying, Memento, NativeEvents, Representing } from '@ephox/alloy';
import { Cell, Fun, Id, Optional } from '@ephox/katamari';
import { Focus, Value } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';

import { onControlAttached, onControlDetached } from '../../controls/Controls';
import { updateMenuText, UpdateMenuTextEvent } from '../../dropdown/CommonDropdown';
import { onSetupEvent } from '../ControlUtils';
import { NumberInputSpec } from './FontSizeBespoke';

interface BespokeSelectApi {
  readonly getComponent: () => AlloyComponent;
}

const createBespokeNumberInput = (editor: Editor, _backstage: UiFactoryBackstage, spec: NumberInputSpec): AlloySpec => {
  let currentComp: Optional<AlloyComponent> = Optional.none();

  const getValueFromCurrentComp = (comp: Optional<AlloyComponent>): string =>
    comp.map((alloyComp) => Representing.getValue(alloyComp)).getOr('');

  const onSetup = onSetupEvent(editor, 'NodeChange', (api: BespokeSelectApi) => {
    const comp = api.getComponent();
    currentComp = Optional.some(comp);
    spec.updateInputValue(comp);
  });

  const getApi = (comp: AlloyComponent): BespokeSelectApi => ({ getComponent: Fun.constant(comp) });
  const editorOffCell = Cell(Fun.noop);

  const customEvents = Id.generate('custom-number-input-events');

  const isValidValue = (value: number): boolean => value >= 0;

  const changeValue = (f: (v: number, step: number) => number): void => {
    const text = getValueFromCurrentComp(currentComp);
    const value = parseFloat(text.match(/(?<value>^[\d\.]+)/)?.groups?.value ?? '0');
    const unitRegexp = new RegExp(`${value}(?<unit>\\D+)$`);
    const unit = text.match(unitRegexp)?.groups?.unit ?? '';
    const newValue = f(value, spec.getConfigFromUnit(unit).step);
    const newValueWithUnit = `${isValidValue(newValue) ? newValue : value}${unit}`;

    spec.onAction(newValueWithUnit);
    currentComp.each((comp) => Representing.setValue(comp, newValueWithUnit));
  };

  const decrease = () => changeValue((n, s) => n - s);
  const increase = () => changeValue((n, s) => n + s);

  const memInput = Memento.record(Input.sketch({
    inputBehaviours: Behaviour.derive([
      AddEventsBehaviour.config(customEvents, [
        onControlAttached({ onSetup, getApi }, editorOffCell),
        onControlDetached({ getApi }, editorOffCell)
      ]),
      AddEventsBehaviour.config('menubutton-update-display-text', [
        AlloyEvents.run<UpdateMenuTextEvent>(updateMenuText, (comp, se) => {
          Representing.setValue(comp, se.event.text);
        }),
        AlloyEvents.run(NativeEvents.focusout(), (_comp, se) => {
          spec.onAction(Value.get(se.event.target));
        }),
        AlloyEvents.run(NativeEvents.change(), (_comp, se) => {
          spec.onAction(Value.get(se.event.target));
        })
      ]),
      Keying.config({
        mode: 'special',
        onEnter: (comp) => {
          spec.onAction(Representing.getValue(comp));
          return Optional.some(true);
        },
        onUp: (comp) => {
          increase();
          // TOFIX: now it preserve the focus but it put the selection at the end of the input
          Focus.focusInside(comp.element);
          return Optional.some(true);
        },
        onDown: (comp) => {
          decrease();
          Focus.focusInside(comp.element);
          return Optional.some(true);
        }
      })
    ])
  }));

  const makeStepperButton = (label: string, action: VoidFunction, classes: string[]) => Button.sketch({
    dom: {
      tag: 'button',
      classes
    },
    components: [
      GuiFactory.text(label)
    ],
    action
  });

  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-number-input' ]
    },
    components: [
      makeStepperButton('-', decrease, [ 'minus' ]),
      memInput.asSpec(),
      makeStepperButton('+', increase, [ 'plus' ])
    ],
    behaviours: Behaviour.derive([
      Focusing.config({}),
      Keying.config({
        mode: 'special',
        onEnter: (comp) => {
          if (Focus.hasFocus(comp.element)) {
            memInput.getOpt(comp).each((input) => Focus.focus(input.element));
            return Optional.some(true);
          } else {
            return Optional.none();
          }
        },
        onEscape: (wrapperComp) => {
          if (Focus.hasFocus(wrapperComp.element)) {
            return Optional.none();
          } else {
            Focus.focus(wrapperComp.element);
            return Optional.some(true);
          }
        }
      })
    ])
  };
};

export { createBespokeNumberInput };
