import { AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloySpec, Behaviour, Button, Focusing, FocusInsideModes, Input, Keying, Memento, NativeEvents, Representing } from '@ephox/alloy';
import { Cell, Fun, Id, Optional } from '@ephox/katamari';
import { Dimension, Focus, SugarElement, Traverse } from '@ephox/sugar';

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

  const onSetup = onSetupEvent(editor, 'NodeChange', (api: BespokeSelectApi) => {
    const comp = api.getComponent();
    currentComp = Optional.some(comp);
    spec.updateInputValue(comp);
  });

  const getApi = (comp: AlloyComponent): BespokeSelectApi => ({ getComponent: Fun.constant(comp) });
  const editorOffCell = Cell(Fun.noop);

  const customEvents = Id.generate('custom-number-input-events');

  const isValidValue = (value: number): boolean => value >= 0;

  const changeValue = (f: (v: number, step: number) => number, focusBack: boolean): void => {
    const text = getValueFromCurrentComp(currentComp);
    const parsedText = Dimension.parse(text, [ 'unsupportedLength' ]);
    const value = parsedText.map((res) => res.value).getOr(0);
    const unit = parsedText.map((res) => res.unit).getOr('');
    const newValue = f(value, spec.getConfigFromUnit(unit).step);
    const newValueWithUnit = `${isValidValue(newValue) ? newValue : value}${unit}`;

    const lenghtDelta = `${value}${unit}`.length - `${newValueWithUnit}`.length;
    const oldStart = currentComp.map((comp) => comp.element.dom.selectionStart - lenghtDelta);
    const oldEnd = currentComp.map((comp) => comp.element.dom.selectionEnd - lenghtDelta);

    spec.onAction(newValueWithUnit, focusBack);
    currentComp.each((comp) => {
      Representing.setValue(comp, newValueWithUnit);
      oldStart.each((oldStart) => comp.element.dom.selectionStart = oldStart);
      oldEnd.each((oldEnd) => comp.element.dom.selectionEnd = oldEnd);
    });
  };

  const decrease = (focusBack: boolean) => changeValue((n, s) => n - s, focusBack);
  const increase = (focusBack: boolean) => changeValue((n, s) => n + s, focusBack);

  const goToParent = (comp: AlloyComponent) =>
    Traverse.parentElement(comp.element).fold(Optional.none, (parent) => {
      Focus.focus(parent);
      return Optional.some(true);
    });

  const memInput = Memento.record({
    dom: {
      tag: 'div',
      classes: [ 'tox-input-wrapper', 'highlight-on-focus' ]
    },
    components: [
      Input.sketch({
        inputBehaviours: Behaviour.derive([
          AddEventsBehaviour.config(customEvents, [
            onControlAttached({ onSetup, getApi }, editorOffCell),
            onControlDetached({ getApi }, editorOffCell)
          ]),
          AddEventsBehaviour.config('menubutton-update-display-text', [
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
            onEnter: (comp) => {
              spec.onAction(Representing.getValue(comp));
              return Optional.some(true);
            },
            onEscape: goToParent,
            onUp: (_comp) => {
              increase(false);
              return Optional.some(true);
            },
            onDown: (_comp) => {
              decrease(false);
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
        onEnter: (comp) => {
          if (Focus.hasFocus(comp.element)) {
            Traverse.firstChild(comp.element).each((input) => Focus.focus(input as SugarElement<HTMLElement>));
            return Optional.some(true);
          } else {
            return Optional.none();
          }
        },
        onEscape: goToParent
      })
    ])
  });

  const makeStepperButton = (action: VoidFunction, title: string, tooltip: string, classes: string[]) => {
    const translatedTooltip = backstage.shared.providers.translate(tooltip);
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
      action
    });
  };

  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-number-input' ]
    },
    components: [
      makeStepperButton(() => decrease(false), 'minus', 'Decrease font size', [ 'highlight-on-focus' ]),
      memInput.asSpec(),
      makeStepperButton(() => increase(false), 'plus', 'Increase font size', [ 'highlight-on-focus' ])
    ],
    behaviours: Behaviour.derive([
      Focusing.config({}),
      Keying.config({
        mode: 'flow',
        focusInside: FocusInsideModes.OnEnterOrSpaceMode,
        cycles: false,
        getInitial: (comp) => memInput.getOpt(comp).map((c) => c.element),
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
