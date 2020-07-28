import { Adt } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

export interface SelectionType {
  fold: <T>(
    none: () => T,
    multiple: (elements: SugarElement<Element>[]) => T,
    single: (element: SugarElement<Element>) => T,
  ) => T;
  match: <T> (branches: {
    none: () => T;
    multiple: (elements: SugarElement<Element>[]) => T;
    single: (element: SugarElement<Element>) => T;
  }) => T;
  log: (label: string) => void;
}

const type: {
  none: () => SelectionType;
  multiple: (elements: SugarElement<Element>[]) => SelectionType;
  single: (element: SugarElement<Element>) => SelectionType;
} = Adt.generate([
  { none: [] },
  { multiple: [ 'elements' ] },
  { single: [ 'element' ] }
]);

export const cata = <T> (subject: SelectionType, onNone: () => T, onMultiple: (multiple: SugarElement<Element>[]) => T, onSingle: (element: SugarElement<Element>) => T) =>
  subject.fold(onNone, onMultiple, onSingle);

export const none = type.none;
export const multiple = type.multiple;
export const single = type.single;