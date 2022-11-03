import { AddEventsBehaviour, AlloyComponent, AlloyEvents, Behaviour, Button, Input, NativeEvents, Representing, SketchSpec } from '@ephox/alloy';
import { Cell, Fun, Id, Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';

import { onControlAttached, onControlDetached } from '../../controls/Controls';
import { updateMenuText, UpdateMenuTextEvent } from '../../dropdown/CommonDropdown';
import { onSetupEvent } from '../ControlUtils';
import { NumberInputSpec } from './FontSizeBespoke';

interface BespokeSelectApi {
  readonly getComponent: () => AlloyComponent;
}

const createBespokeNumberInput = (editor: Editor, backstage: UiFactoryBackstage, spec: NumberInputSpec): SketchSpec => {
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

  const changeValue = (f: (v: number) => number): void => {
    const text = currentValue.get();
    const unit = text.match(/\D+$/)?.join('');
    const value = parseInt(text.match(/^\d+/)?.join('') || '0', 10);
    const newValue = `${f(value)}${unit}`;

    spec.onAction(newValue);
    currentValue.set(newValue);
    currentComp.get().each((comp) => Representing.setValue(comp, newValue));
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
      }
    },
    components: [
      Button.sketch({
        dom: {
          tag: 'button',
          styles: buttonStyles,
          innerHtml: '-',
        },
        action: () => changeValue((n) => n - 1)
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
        action: () => changeValue((n) => n + 1)
      })
    ]
  };
};

export { createBespokeNumberInput };
