import Responses from '../api/Responses';
import KeySelection from './KeySelection';
import TableKeys from './TableKeys';
import Util from '../selection/Util';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { DomGather } from '@ephox/phoenix';
import { PlatformDetection } from '@ephox/sand';
import { Compare } from '@ephox/sugar';
import { PredicateExists } from '@ephox/sugar';
import { SelectorFilter } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';
import { Awareness } from '@ephox/sugar';
import { CursorPosition } from '@ephox/sugar';

var detection = PlatformDetection.detect();

var inSameTable = function (elem, table) {
  return PredicateExists.ancestor(elem, function (e) {
    return Traverse.parent(e).exists(function (p) {
      return Compare.eq(p, table);
    });
  });
};

interface Simulated {
  start: () => number,
  finish: () => number,
  range: () => any
};

// Note: initial is the finishing element, because that's where the cursor starts from
// Anchor is the starting element, and is only used to work out if we are in the same table
var simulate = function (bridge, isRoot, direction, initial, anchor) {
  return SelectorFind.closest(initial, 'td,th', isRoot).bind(function (start) {
    return SelectorFind.closest(start, 'table', isRoot).bind<Simulated>(function (table) {
      if (!inSameTable(anchor, table)) return Option.none();
      return TableKeys.handle(bridge, isRoot, direction).bind(function (range) {
        return SelectorFind.closest(range.finish(), 'td,th', isRoot).map(function (finish) {
          return {
            start: Fun.constant(start),
            finish: Fun.constant(finish),
            range: Fun.constant(range)
          };
        });
      });
    });
  });
};

var navigate = function (bridge, isRoot, direction, initial, anchor, precheck) {
  // Do not override the up/down keys on IE.
  if (detection.browser.isIE()) {
    return Option.none();
  } else {
    return precheck(initial, isRoot).orThunk(function () {
      return simulate(bridge, isRoot, direction, initial, anchor).map(function (info) {
        var range = info.range();
        return Responses.response(
          Option.some(Util.makeSitus(range.start(), range.soffset(), range.finish(), range.foffset())),
          true
        );
      });
    });
  }
};

var firstUpCheck = function (initial, isRoot) {
  return SelectorFind.closest(initial, 'tr', isRoot).bind(function (startRow) {
    return SelectorFind.closest(startRow, 'table', isRoot).bind(function (table) {
      var rows = SelectorFilter.descendants(table, 'tr');
      if (Compare.eq(startRow, rows[0])) {
        return DomGather.seekLeft(table, function (element) {
          return CursorPosition.last(element).isSome();
        }, isRoot).map(function (last) {
          var lastOffset = Awareness.getEnd(last);
          return Responses.response(
            Option.some(Util.makeSitus(last, lastOffset, last, lastOffset)),
            true
          );
        });
      } else {
        return Option.none();
      }
    });
  });
};

var lastDownCheck = function (initial, isRoot) {
  return SelectorFind.closest(initial, 'tr', isRoot).bind(function (startRow) {
    return SelectorFind.closest(startRow, 'table', isRoot).bind(function (table) {
      var rows = SelectorFilter.descendants(table, 'tr');
      if (Compare.eq(startRow, rows[rows.length - 1])) {
        return DomGather.seekRight(table, function (element) {
          return CursorPosition.first(element).isSome();
        }, isRoot).map(function (first) {
          return Responses.response(
            Option.some(Util.makeSitus(first, 0, first, 0)),
            true
          );
        });
      } else {
        return Option.none();
      }
    });
  });
};

var select = function (bridge, container, isRoot, direction, initial, anchor, selectRange) {
  return simulate(bridge, isRoot, direction, initial, anchor).bind(function (info) {
    return KeySelection.detect(container, isRoot, info.start(), info.finish(), selectRange);
  });
};

export default <any> {
  navigate: navigate,
  select: select,
  firstUpCheck: firstUpCheck,
  lastDownCheck: lastDownCheck
};