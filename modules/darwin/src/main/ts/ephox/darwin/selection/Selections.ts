import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as SelectionTypes from '../api/SelectionTypes';
import * as TableSelection from '../api/TableSelection';

export interface Selections {
  readonly get: () => SelectionTypes.SelectionType;
}

export const Selections = (lazyRoot: () => SugarElement<Element>, getStart: () => Optional<SugarElement<HTMLTableCellElement>>, selectedSelector: string): Selections => {
  const get = () => TableSelection.retrieve<HTMLTableCellElement>(lazyRoot(), selectedSelector).fold(
    () => getStart().fold(SelectionTypes.none, SelectionTypes.single),
    SelectionTypes.multiple
  );

  return {
    get
  };
};
