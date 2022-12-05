import { AddEventsBehaviour, AlloyComponent, AlloyEvents, Behaviour, Button, Focusing, Input, Keying, NativeEvents, Representing, SketchSpec } from '@ephox/alloy';
import { Cell, Fun, Id, Optional } from '@ephox/katamari';
import { Focus, SugarElement, Traverse } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';

import { onControlAttached, onControlDetached } from '../../controls/Controls';
import { updateMenuText, UpdateMenuTextEvent } from '../../dropdown/CommonDropdown';
import { onSetupEvent } from '../ControlUtils';
import { NumberInputSpec } from './FontSizeBespoke';

interface BespokeSelectApi {
  readonly getComponent: () => AlloyComponent;
}

const createBespokeNumberInput = (editor: Editor, _backstage: UiFactoryBackstage, spec: NumberInputSpec): SketchSpec => {
  const currentValue = Cell('');
  const currentComp: Cell<Optional<AlloyComponent>> = Cell(Optional.none());

  const onSetup = onSetupEvent(editor, 'NodeChange', (api: BespokeSelectApi) => {
    const comp = api.getComponent();
    currentComp.set(Optional.some(comp));
    spec.updateText(comp);
  });
  const getApi = (comp: AlloyComponent): BespokeSelectApi => ({ getComponent: Fun.constant(comp) });
  const editorOffCell = Cell(Fun.noop);

  const customEvents = Id.generate('custom-number-input-events');

  const isValidValue = (value: number): boolean => value >= 0;

  const changeValue = (f: (v: number, step: number) => number): void => {
    const text = currentValue.get();
    const value = parseFloat(text.match(/^[\d\.]+/)?.join('') || '0');
    const unitRegexp = new RegExp(`(?<=${value})\\D+$`);
    const unit = text.match(unitRegexp)?.join('') || '';
    const newValue = f(value, spec.getConfigFromUnit(unit).step);
    const newValueWithUnit = `${isValidValue(newValue) ? newValue : value}${unit}`;

    spec.onAction(newValueWithUnit);
    currentValue.set(newValueWithUnit);
    currentComp.get().each((comp) => Representing.setValue(comp, newValueWithUnit));
  };

  const buttonStyles = {
    'width': '20px',
    'text-align': 'center',
    'background-color': 'grey'
  };

  return {
    uid: Id.generate('number-input-wrapper'),
    dom: {
      tag: 'div',
      styles: {
        display: 'flex'
      },
      classes: [ 'number-input-wrapper' ]
    },
    components: [
      Button.sketch({
        dom: {
          tag: 'button',
          styles: buttonStyles,
          innerHtml: '-',
        },
        action: () => changeValue((n, s) => n - s)
      }),
      Input.sketch({
        inputStyles: {
          'width': '75px',
          'text-align': 'center'
        },
        inputBehaviours: Behaviour.derive([
          AddEventsBehaviour.config(customEvents, [
            onControlAttached({ onSetup, getApi }, editorOffCell),
            onControlDetached({ getApi }, editorOffCell)
          ]),
          AddEventsBehaviour.config('menubutton-update-display-text', [
            AlloyEvents.run<UpdateMenuTextEvent>(updateMenuText, (comp, se) => {
              Representing.setValue(comp, se.event.text);
              currentValue.set(se.event.text);
            }),
            AlloyEvents.run(NativeEvents.change(), (_comp, se) => {
              spec.onAction(se.event.target.dom.value);
            })
          ])
        ])
      }),
      Button.sketch({
        dom: {
          tag: 'button',
          styles: buttonStyles,
          innerHtml: '+'
        },
        action: () => changeValue((n, s) => n + s)
      })
    ],
    behaviours: Behaviour.derive([
      Focusing.config({}),
      Keying.config({
        mode: 'special',
        onEnter: (comp) => {
          if (Focus.hasFocus(comp.element)) {
            Traverse.child(comp.element, 1).each((inputElement) => {
              Focus.focus(inputElement as SugarElement<HTMLElement>);
            });
            return Optional.some(true);
          } else {
            return Optional.none();
          }
        },
        onEscape: (wrapperComp) => {
          if (Focus.hasFocus(wrapperComp.element)) {
            return Optional.none();
          } else {
            Focusing.focus(wrapperComp);
            return Optional.some(true);
          }
        }
      })
    ])
  };
};

export { createBespokeNumberInput };
