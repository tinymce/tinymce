import { Option } from '@ephox/katamari';
import { Awareness, Compare, Element, SelectorFind } from '@ephox/sugar';
import { Response } from '../selection/Response';
import * as CellSelection from '../selection/CellSelection';
import * as Util from '../selection/Util';
import { SelectionAnnotation } from '../api/SelectionAnnotation';
import { IdentifiedExt } from '../selection/Identified';

// Based on a start and finish, select the appropriate box of cells
const sync = function (container: Element, isRoot: (element: Element) => boolean, start: Element, soffset: number, finish: Element, foffset: number, selectRange: (container: Element, boxes: Element[], start: Element, finish: Element) => void) {
  if (!(Compare.eq(start, finish) && soffset === foffset)) {
    return SelectorFind.closest(start, 'td,th', isRoot).bind(function (s) {
      return SelectorFind.closest(finish, 'td,th', isRoot).bind(function (f) {
        return detect(container, isRoot, s, f, selectRange);
      });
    });
  } else {
    return Option.none<Response>();
  }
};

// If the cells are different, and there is a rectangle to connect them, select the cells.
const detect = function (container: Element, isRoot: (element: Element) => boolean, start: Element, finish: Element, selectRange: (container: Element, boxes: Element[], start: Element, finish: Element) => void) {
  if (!Compare.eq(start, finish)) {
    return CellSelection.identify(start, finish, isRoot).bind(function (cellSel) {
      const boxes = cellSel.boxes.getOr([]);
      if (boxes.length > 0) {
        selectRange(container, boxes, cellSel.start, cellSel.finish);
        return Option.some(Response.create(
          Option.some(Util.makeSitus(start, 0, start, Awareness.getEnd(start))),
          true
        ));
      } else {
        return Option.none<Response>();
      }
    });
  } else {
    return Option.none<Response>();
  }
};

const update = function (rows: number, columns: number, container: Element, selected: Element[], annotations: SelectionAnnotation) {
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
