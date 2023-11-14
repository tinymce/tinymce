import { Keys } from '@ephox/agar';
import { AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloySpec, Behaviour, Button, Disabling, Focusing, FocusInsideModes, Input, Keying, Memento, NativeEvents, Representing } from '@ephox/alloy';
import { Arr, Cell, Fun, Id, Optional } from '@ephox/katamari';
import { Focus, SugarElement, Traverse } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';

import { renderIconFromPack } from '../../button/ButtonSlices';
import { onControlAttached, onControlDetached } from '../../controls/Controls';
import { updateMenuText, UpdateMenuTextEvent } from '../../dropdown/CommonDropdown';
import { onSetupEvent } from '../ControlUtils';
import { NumberInputSpec } from './FontSizeBespoke';

interface BespokeSelectApi {
  readonly getComponent: () => AlloyComponent;
}

const createBespokeNumberInput = (editor: Editor, backstage: UiFactoryBackstage, spec: NumberInputSpec): AlloySpec => {
  let currentComp: Optional<AlloyComponent> = Optional.none();

  const getValueFromCurrentComp = (comp: Optional<AlloyComponent>): string =>
    comp.map((alloyComp) => Representing.getValue(alloyComp)).getOr('');

  const onSetup = onSetupEvent(editor, 'NodeChange SwitchMode', (api: BespokeSelectApi) => {
    const comp = api.getComponent();
    currentComp = Optional.some(comp);
    spec.updateInputValue(comp);
    Disabling.set(comp, !editor.selection.isEditable());
  });

  const getApi = (comp: AlloyComponent): BespokeSelectApi => ({ getComponent: Fun.constant(comp) });
  const editorOffCell = Cell(Fun.noop);

  const customEvents = Id.generate('custom-number-input-events');

  const changeValue = (f: (v: number, step: number) => number, fromInput: boolean, focusBack: boolean): void => {
    const text = getValueFromCurrentComp(currentComp);

    const newValue = spec.getNewValue(text, f);

    const lenghtDelta = text.length - `${newValue}`.length;
    const oldStart = currentComp.map((comp) => comp.element.dom.selectionStart - lenghtDelta);
    const oldEnd = currentComp.map((comp) => comp.element.dom.selectionEnd - lenghtDelta);

    spec.onAction(newValue, focusBack);
    currentComp.each((comp) => {
      Representing.setValue(comp, newValue);
      if (fromInput) {
        oldStart.each((oldStart) => comp.element.dom.selectionStart = oldStart);
        oldEnd.each((oldEnd) => comp.element.dom.selectionEnd = oldEnd);
      }
    });
  };

  const decrease = (fromInput: boolean, focusBack: boolean) => changeValue((n, s) => n - s, fromInput, focusBack);
  const increase = (fromInput: boolean, focusBack: boolean) => changeValue((n, s) => n + s, fromInput, focusBack);

  const goToParent = (comp: AlloyComponent) =>
    Traverse.parentElement(comp.element).fold(Optional.none, (parent) => {
      Focus.focus(parent);
      return Optional.some(true);
    });

  const focusInput = (comp: AlloyComponent) => {
    if (Focus.hasFocus(comp.element)) {
      Traverse.firstChild(comp.element).each((input) => Focus.focus(input as SugarElement<HTMLElement>));
      return Optional.some(true);
    } else {
      return Optional.none();
    }
  };

  const makeStepperButton = (action: (focusBack: boolean) => void, title: string, tooltip: string, classes: string[]) => {
    const editorOffCellStepButton = Cell(Fun.noop);
    const translatedTooltip = backstage.shared.providers.translate(tooltip);
    const altExecuting = Id.generate('altExecuting');
    const onSetup = onSetupEvent(editor, 'NodeChange SwitchMode', (api: BespokeSelectApi) => {
      Disabling.set(api.getComponent(), !editor.selection.isEditable());
    });

    const onClick = (comp: AlloyComponent) => {
      if (!Disabling.isDisabled(comp)) {
        action(true);
      }
    };

    return Button.sketch({
      dom: {
        tag: 'button',
        attributes: {
          'title': translatedTooltip,
          'aria-label': translatedTooltip
        },
        classes: classes.concat(title)
      },
      components: [
        renderIconFromPack(title, backstage.shared.providers.icons)
      ],
      buttonBehaviours: Behaviour.derive([
        Disabling.config({}),
        AddEventsBehaviour.config(altExecuting, [
          onControlAttached({ onSetup, getApi }, editorOffCellStepButton),
          onControlDetached({ getApi }, editorOffCellStepButton),
          AlloyEvents.run(NativeEvents.keydown(), (comp, se) => {
            if (se.event.raw.keyCode === Keys.space() || se.event.raw.keyCode === Keys.enter()) {
              if (!Disabling.isDisabled(comp)) {
                action(false);
              }
            }
          }),
          AlloyEvents.run(NativeEvents.click(), onClick),
          AlloyEvents.run(NativeEvents.touchend(), onClick)
        ])
      ]),
      eventOrder: {
        [NativeEvents.keydown()]: [ altExecuting, 'keying' ],
        [NativeEvents.click()]: [ altExecuting, 'alloy.base.behaviour' ],
        [NativeEvents.touchend()]: [ altExecuting, 'alloy.base.behaviour' ]
      }
    });
  };

  const memMinus = Memento.record(makeStepperButton((focusBack) => decrease(false, focusBack), 'minus', 'Decrease font size', []));
  const memPlus = Memento.record(makeStepperButton((focusBack) => increase(false, focusBack), 'plus', 'Increase font size', []));

  const memInput = Memento.record({
    dom: {
      tag: 'div',
      classes: [ 'tox-input-wrapper' ]
    },
    components: [
      Input.sketch({
        inputBehaviours: Behaviour.derive([
          Disabling.config({}),
          AddEventsBehaviour.config(customEvents, [
            onControlAttached({ onSetup, getApi }, editorOffCell),
            onControlDetached({ getApi }, editorOffCell)
          ]),
          AddEventsBehaviour.config('input-update-display-text', [
            AlloyEvents.run<UpdateMenuTextEvent>(updateMenuText, (comp, se) => {
              Representing.setValue(comp, se.event.text);
            }),
            AlloyEvents.run(NativeEvents.focusout(), (comp) => {
              spec.onAction(Representing.getValue(comp));
            }),
            AlloyEvents.run(NativeEvents.change(), (comp) => {
              spec.onAction(Representing.getValue(comp));
            })
          ]),
          Keying.config({
            mode: 'special',
            onEnter: (_comp) => {
              changeValue(Fun.identity, true, true);
              return Optional.some(true);
            },
            onEscape: goToParent,
            onUp: (_comp) => {
              increase(true, false);
              return Optional.some(true);
            },
            onDown: (_comp) => {
              decrease(true, false);
              return Optional.some(true);
            },
            onLeft: (_comp, se) => {
              se.cut();
              return Optional.none();
            },
            onRight: (_comp, se) => {
              se.cut();
              return Optional.none();
            }
          })
        ])
      })
    ],
    behaviours: Behaviour.derive([
      Focusing.config({}),
      Keying.config({
        mode: 'special',
        onEnter: focusInput,
        onSpace: focusInput,
        onEscape: goToParent
      }),
      AddEventsBehaviour.config('input-wrapper-events', [
        AlloyEvents.run(NativeEvents.mouseover(), (comp) => {
          Arr.each([ memMinus, memPlus ], (button) => {
            const buttonNode = SugarElement.fromDom(button.get(comp).element.dom);
            if (Focus.hasFocus(buttonNode)) {
              Focus.blur(buttonNode);
            }
          });
        })
      ])
    ])
  });

  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-number-input' ]
    },
    components: [
      memMinus.asSpec(),
      memInput.asSpec(),
      memPlus.asSpec()
    ],
    behaviours: Behaviour.derive([
      Focusing.config({}),
      Keying.config({
        mode: 'flow',
        focusInside: FocusInsideModes.OnEnterOrSpaceMode,
        cycles: false,
        selector: 'button, .tox-input-wrapper',
        onEscape: (wrapperComp) => {
          if (Focus.hasFocus(wrapperComp.element)) {
            return Optional.none();
          } else {
            Focus.focus(wrapperComp.element);
            return Optional.some(true);
          }
        },
      })
    ])
  };
};

export { createBespokeNumberInput };
