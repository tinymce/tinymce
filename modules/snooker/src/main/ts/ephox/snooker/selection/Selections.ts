import { TableSelection } from '@ephox/darwin';
import { SugarElement } from '@ephox/sugar';
import SelectionTypes, { SelectionType } from './SelectionTypes';

export interface Selections {
  get: () => SelectionType;
}

// tslint:disable-next-line:variable-name
export const Selections = (root: SugarElement<Element>, getStart: any, selectedSelector: string) => {
  const get = () => TableSelection.retrieve(root, selectedSelector).fold(
    () => getStart().map(SelectionTypes.single).getOr(SelectionTypes.none()),
    (cells: SugarElement<Element>[]) => SelectionTypes.multiple(cells)
  );

  return {
    get
  };
};