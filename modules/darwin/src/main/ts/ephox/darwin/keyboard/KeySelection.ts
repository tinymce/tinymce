import { Optional } from '@ephox/katamari';
import { Awareness, Compare, SelectorFind, SugarElement } from '@ephox/sugar';

import { SelectionAnnotation } from '../api/SelectionAnnotation';
import * as CellSelection from '../selection/CellSelection';
import { IdentifiedExt } from '../selection/Identified';
import { Response } from '../selection/Response';
import * as Util from '../selection/Util';

// Based on a start and finish, select the appropriate box of cells
const sync = (
  container: SugarElement<Node>,
  isRoot: (element: SugarElement<Node>) => boolean,
  start: SugarElement<Node>,
  soffset: number,
  finish: SugarElement<Node>,
  foffset: number,
  selectRange: (container: SugarElement<Node>, boxes: SugarElement<HTMLTableCellElement>[], start: SugarElement<HTMLTableCellElement>, finish: SugarElement<HTMLTableCellElement>) => void
): Optional<Response> => {
  if (!(Compare.eq(start, finish) && soffset === foffset)) {
    return SelectorFind.closest<HTMLTableCellElement>(start, 'td,th', isRoot).bind((s) => {
      return SelectorFind.closest<HTMLTableCellElement>(finish, 'td,th', isRoot).bind((f) => {
        return detect(container, isRoot, s, f, selectRange);
      });
    });
  } else {
    return Optional.none<Response>();
  }
};

// If the cells are different, and there is a rectangle to connect them, select the cells.
const detect = (
  container: SugarElement<Node>,
  isRoot: (element: SugarElement<Node>) => boolean,
  start: SugarElement<HTMLTableCellElement>,
  finish: SugarElement<HTMLTableCellElement>,
  selectRange: (container: SugarElement<Node>, boxes: SugarElement<HTMLTableCellElement>[], start: SugarElement<HTMLTableCellElement>, finish: SugarElement<HTMLTableCellElement>) => void
): Optional<Response> => {
  if (!Compare.eq(start, finish)) {
    return CellSelection.identify(start, finish, isRoot).bind((cellSel) => {
      const boxes = cellSel.boxes.getOr([]);
      if (boxes.length > 1) {
        selectRange(container, boxes, cellSel.start, cellSel.finish);
        return Optional.some(Response.create(
          Optional.some(Util.makeSitus(start, 0, start, Awareness.getEnd(start))),
          true
        ));
      } else {
        return Optional.none<Response>();
      }
    });
  } else {
    return Optional.none<Response>();
  }
};

const update = (
  rows: number,
  columns: number,
  container: SugarElement<Node>,
  selected: SugarElement<HTMLTableCellElement>[],
  annotations: SelectionAnnotation
): Optional<SugarElement<HTMLTableCellElement>[]> => {
  const updateSelection = (newSels: IdentifiedExt) => {
    annotations.clearBeforeUpdate(container);
    annotations.selectRange(container, newSels.boxes, newSels.start, newSels.finish);
    return newSels.boxes;
  };

  return CellSelection.shiftSelection(selected, rows, columns, annotations.firstSelectedSelector, annotations.lastSelectedSelector).map(updateSelection);
};

export {
  sync,
  detect,
  update
};
