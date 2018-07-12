import { HTMLInputElement } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { Attr, Value } from '@ephox/sugar';

import { Representing } from '../../api/behaviour/Representing';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { TypeaheadData } from '../../ui/types/TypeaheadTypes';

export interface TypeaheadModelDetail {
  getDisplayText: () => (item: TypeaheadData) => string;
  getMatchingText: () => (excerpt: string, item: TypeaheadData) => string;
  selectsOver: () => boolean;
}

// When showing a value in an input field, which part of the item do we use?
const setValueFromItem = (model: TypeaheadModelDetail, input: AlloyComponent, item: AlloyComponent) => {
  const itemData = Representing.getValue(item);
  const displayText = model.getDisplayText()(itemData);
  Representing.setValue(input, displayText);
  setCursorAtEnd(input);
}

const setCursorAtEnd = (input: AlloyComponent): void => {
  // Only do for valid input types.
  const el = input.element();
  const value = Value.get(el);
  const node = el.dom() as HTMLInputElement;
  if (Attr.get(el, 'type') !== 'number') {
    node.setSelectionRange(value.length, value.length);
  }
}

// DUPE
const setSelectionToEnd = (input: AlloyComponent, startOffset: number): void => {
  // Only do for valid input types.
  const el = input.element();
  const value = Value.get(el);
  const node = el.dom() as HTMLInputElement;
  if (Attr.get(el, 'type') !== 'number') {
    node.setSelectionRange(startOffset, value.length);
  }
}

const attemptSelectOver = (model: TypeaheadModelDetail, input: AlloyComponent, item: AlloyComponent): Option<() => void> => {
  if (! model.selectsOver()) return Option.none()
  else {
    const currentValue = Representing.getValue(input);
    const inputDisplay = model.getDisplayText()(currentValue);

    const itemValue = Representing.getValue(item);
    const itemDisplay = model.getDisplayText()(itemValue);

    return itemDisplay.indexOf(inputDisplay) === 0 ?
      Option.some(() => {
        setValueFromItem(model, input, item);
        setSelectionToEnd(input, inputDisplay.length);
      })
      : Option.none()
  }
};

export {
  attemptSelectOver,
  setValueFromItem,
  setCursorAtEnd
}
