import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import * as TableSelection from '../api/TableSelection';
import * as SelectionTypes from './SelectionTypes';

export interface Selections {
  get: () => SelectionTypes.SelectionType;
}

export const Selections = (lazyRoot: () => SugarElement<Element>, getStart: () => Optional<SugarElement<HTMLTableCellElement | HTMLTableCaptionElement>>, selectedSelector: string): Selections => {
  const get = () => TableSelection.retrieve(lazyRoot(), selectedSelector).fold(
    () => getStart().map(SelectionTypes.single).getOrThunk(SelectionTypes.none),
    (cells: SugarElement<Element>[]) => SelectionTypes.multiple(cells)
  );

  return {
    get
  };
};