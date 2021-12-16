import { SugarElement } from '@ephox/sugar';

export const enum SelectionTypeTag {
  None = 'none',
  Single = 'single',
  Multiple = 'multiple'
}

interface SelectionTypeNone {
  readonly tag: SelectionTypeTag.None;
}

interface SelectionTypeSingle {
  readonly tag: SelectionTypeTag.Single;
  readonly element: SugarElement<HTMLTableCellElement>;
}

interface SelectionTypeMultiple {
  readonly tag: SelectionTypeTag.Multiple;
  readonly elements: SugarElement<HTMLTableCellElement>[];
}

export type SelectionType = SelectionTypeNone | SelectionTypeSingle | SelectionTypeMultiple;

export const fold = <T> (subject: SelectionType, onNone: () => T, onMultiple: (multiple: SugarElement<HTMLTableCellElement>[]) => T, onSingle: (element: SugarElement<HTMLTableCellElement>) => T): T => {
  switch (subject.tag) {
    case SelectionTypeTag.None:
      return onNone();
    case SelectionTypeTag.Single:
      return onSingle(subject.element);
    case SelectionTypeTag.Multiple:
      return onMultiple(subject.elements);
  }
};

export const none = (): SelectionType => ({ tag: SelectionTypeTag.None });
export const multiple = (elements: SugarElement<HTMLTableCellElement>[]): SelectionType => ({ tag: SelectionTypeTag.Multiple, elements });
export const single = (element: SugarElement<HTMLTableCellElement>): SelectionType => ({ tag: SelectionTypeTag.Single, element });
