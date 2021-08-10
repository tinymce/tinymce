import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as TableSelection from '../api/TableSelection';
import * as SelectionTypes from './SelectionTypes';

export interface Selections {
  readonly get: () => SelectionTypes.SelectionType;
}

export const Selections = (lazyRoot: () => SugarElement<Element>, getStart: () => Optional<SugarElement<HTMLTableCellElement>>, selectedSelector: string): Selections => {
  const get = () => TableSelection.retrieve<HTMLTableCellElement>(lazyRoot(), selectedSelector).fold(
    () => getStart().fold(SelectionTypes.none, SelectionTypes.single),
    (cells) => SelectionTypes.multiple(cells)
  );

  return {
    get
  };
};
