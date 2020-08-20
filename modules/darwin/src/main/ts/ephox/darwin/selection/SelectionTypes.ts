import { Adt } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

export interface SelectionType {
  fold: <T>(
    none: () => T,
    multiple: (elements: SugarElement<HTMLTableCellElement>[]) => T,
    single: (element: SugarElement<HTMLTableCellElement | HTMLTableCaptionElement>) => T,
  ) => T;
  match: <T> (branches: {
    none: () => T;
    multiple: (elements: SugarElement<HTMLTableCellElement>[]) => T;
    single: (element: SugarElement<HTMLTableCellElement | HTMLTableCaptionElement>) => T;
  }) => T;
  log: (label: string) => void;
}

const type: {
  none: () => SelectionType;
  multiple: (elements: SugarElement<HTMLTableCellElement>[]) => SelectionType;
  single: (element: SugarElement<HTMLTableCellElement | HTMLTableCaptionElement>) => SelectionType;
} = Adt.generate([
  { none: [] },
  { multiple: [ 'elements' ] },
  { single: [ 'element' ] }
]);

export const cata = <T> (subject: SelectionType, onNone: () => T, onMultiple: (multiple: SugarElement<Element>[]) => T, onSingle: (element: SugarElement<HTMLTableCellElement | HTMLTableCaptionElement>) => T) =>
  subject.fold(onNone, onMultiple, onSingle);

export const none = type.none;
export const multiple = type.multiple;
export const single = type.single;