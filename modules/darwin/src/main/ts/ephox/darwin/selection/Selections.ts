import { Arr, Fun, Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as TableSelection from '../api/TableSelection';

export interface Selections {
  readonly get: () => SugarElement<HTMLTableCellElement>[];
}

export const Selections = (lazyRoot: () => SugarElement<Element>, getStart: () => Optional<SugarElement<HTMLTableCellElement>>, selectedSelector: string): Selections => {
  const get = () => TableSelection.retrieve<HTMLTableCellElement>(lazyRoot(), selectedSelector).fold(
    () => getStart().fold(Fun.constant([]), Arr.pure),
    Fun.identity
  );

  return {
    get
  };
};
