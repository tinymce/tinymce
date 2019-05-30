import Responses from '../api/Responses';
import CellSelection from '../selection/CellSelection';
import Util from '../selection/Util';
import { Option } from '@ephox/katamari';
import { Compare } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';
import { Awareness } from '@ephox/sugar';

// Based on a start and finish, select the appropriate box of cells
var sync = function (container, isRoot, start, soffset, finish, foffset, selectRange) {
  if (!(Compare.eq(start, finish) && soffset === foffset)) {
    return SelectorFind.closest(start, 'td,th', isRoot).bind(function (s) {
      return SelectorFind.closest(finish, 'td,th', isRoot).bind(function (f) {
        return detect(container, isRoot, s, f, selectRange);
      });
    });
  } else {
    return Option.none();
  }
};

// If the cells are different, and there is a rectangle to connect them, select the cells.
var detect = function (container, isRoot, start, finish, selectRange) {
  if (! Compare.eq(start, finish)) {
    return CellSelection.identify(start, finish, isRoot).bind(function (cellSel) {
      var boxes = cellSel.boxes().getOr([]);
      if (boxes.length > 0) {
        selectRange(container, boxes, cellSel.start(), cellSel.finish());
        return Option.some(Responses.response(
          Option.some(Util.makeSitus(start, 0, start, Awareness.getEnd(start))),
          true
        ));
      } else {
        return Option.none();
      }
    });
  } else {
    return Option.none();
  }
};

var update = function (rows, columns, container, selected, annotations) {
  var updateSelection = function (newSels) {
    annotations.clear(container);
    annotations.selectRange(container, newSels.boxes(), newSels.start(), newSels.finish());
    return newSels.boxes();
  };

  return CellSelection.shiftSelection(selected, rows, columns, annotations.firstSelectedSelector(), annotations.lastSelectedSelector()).map(updateSelection);
};

export default <any> {
  sync: sync,
  detect: detect,
  update: update
};