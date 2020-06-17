import { Element as DomElement, Node, Range } from '@ephox/dom-globals';
import { Adt } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

export interface Selection {
  getStart: () => Node;
  setRng: (rng: Range) => void;
}

export interface SelectionTypes extends Adt {
  fold: <T>(
    none: () => T,
    multiple: (elements: Element<DomElement>[]) => T,
    single: (selection: Selection) => T,
  ) => T;
}

const type = Adt.generate<{
  none: () => SelectionTypes;
  multiple: (elements: Element<DomElement>[]) => SelectionTypes;
  single: (selection: Selection) => SelectionTypes;
}>([
      { none: [] },
      { multiple: [ 'elements' ] },
      { single: [ 'selection' ] }
    ]);

const cata = <T> (subject: SelectionTypes, onNone: () => T, onMultiple: (multiple: Element<DomElement>[]) => T, onSingle: (selection: Selection) => T) =>
  subject.fold(onNone, onMultiple, onSingle);

// tslint:disable-next-line:variable-name
export const SelectionTypes = {
  cata,
  none: type.none,
  multiple: type.multiple,
  single: type.single
};