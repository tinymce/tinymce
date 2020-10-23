import { Optional } from '@ephox/katamari';
import { Awareness, Compare, SelectorFind, SugarElement } from '@ephox/sugar';
import { SelectionAnnotation } from '../api/SelectionAnnotation';
import * as CellSelection from '../selection/CellSelection';
import { IdentifiedExt } from '../selection/Identified';
import { Response } from '../selection/Response';
import * as Util from '../selection/Util';

// Based on a start and finish, select the appropriate box of cells
const sync = function (container: SugarElement, isRoot: (element: SugarElement) => boolean, start: SugarElement, soffset: number, finish: SugarElement,
                       foffset: number, selectRange: (container: SugarElement, boxes: SugarElement[], start: SugarElement, finish: SugarElement) => void) {
  if (!(Compare.eq(start, finish) && soffset === foffset)) {
    return SelectorFind.closest(start, 'td,th', isRoot).bind(function (s) {
      return SelectorFind.closest(finish, 'td,th', isRoot).bind(function (f) {
        return detect(container, isRoot, s, f, selectRange);
      });
    });
  } else {
    return Optional.none<Response>();
  }
};

// If the cells are different, and there is a rectangle to connect them, select the cells.
const detect = function (container: SugarElement, isRoot: (element: SugarElement) => boolean, start: SugarElement, finish: SugarElement,
                         selectRange: (container: SugarElement, boxes: SugarElement[], start: SugarElement, finish: SugarElement) => void) {
  if (!Compare.eq(start, finish)) {
    return CellSelection.identify(start, finish, isRoot).bind(function (cellSel) {
      const boxes = cellSel.boxes.getOr([]);
      if (boxes.length > 0) {
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

const update = function (rows: number, columns: number, container: SugarElement, selected: SugarElement[], annotations: SelectionAnnotation) {
  const updateSelection = function (newSels: IdentifiedExt) {
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
