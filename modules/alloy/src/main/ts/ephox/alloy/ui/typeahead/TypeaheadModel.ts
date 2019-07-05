import { HTMLInputElement } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { Attr, Value } from '@ephox/sugar';

import { Representing } from '../../api/behaviour/Representing';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { TypeaheadModelDetail } from '../types/TypeaheadTypes';

// When showing a value in an input field, which part of the item do we use?
const setValueFromItem = (model: TypeaheadModelDetail, input: AlloyComponent, item: AlloyComponent) => {
  const itemData = Representing.getValue(item);
  Representing.setValue(input, itemData);
  setCursorAtEnd(input);
};

const setSelectionOn = (input: AlloyComponent, f: (node: HTMLInputElement, value: string) => void) => {
  const el = input.element();
  const value = Value.get(el);
  const node = el.dom() as HTMLInputElement;
  // Only do for valid input types.
  if (Attr.get(el, 'type') !== 'number') {
    f(node, value);
  }
};

const setCursorAtEnd = (input: AlloyComponent): void => {
  setSelectionOn(input, (node, value) => node.setSelectionRange(value.length, value.length));
};

const setSelectionToEnd = (input: AlloyComponent, startOffset: number): void => {
  setSelectionOn(input, (node, value) => node.setSelectionRange(startOffset, value.length));
};

const attemptSelectOver = (model: TypeaheadModelDetail, input: AlloyComponent, item: AlloyComponent): Option<() => void> => {
  if (!model.selectsOver) {
    return Option.none();
  } else {
    const currentValue = Representing.getValue(input);
    const inputDisplay = model.getDisplayText(currentValue);

    const itemValue = Representing.getValue(item);
    const itemDisplay = model.getDisplayText(itemValue);

    return itemDisplay.indexOf(inputDisplay) === 0 ?
      Option.some(() => {
        setValueFromItem(model, input, item);
        setSelectionToEnd(input, inputDisplay.length);
      })
      : Option.none();
  }
};

export {
  attemptSelectOver,
  setValueFromItem,
  setCursorAtEnd
};
