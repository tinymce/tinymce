import { Fun, Option } from '@ephox/katamari';
import { DomGather } from '@ephox/phoenix';
import { PlatformDetection } from '@ephox/sand';
import { Awareness, Compare, CursorPosition, Element, PredicateExists, SelectorFilter, SelectorFind, SimRange, Traverse } from '@ephox/sugar';
import { WindowBridge } from '../api/WindowBridge';
import { KeyDirection } from '../navigation/KeyDirection';
import { Response } from '../selection/Response';
import * as Util from '../selection/Util';
import * as KeySelection from './KeySelection';
import * as TableKeys from './TableKeys';

const inSameTable = function (elem: Element, table: Element) {
  return PredicateExists.ancestor(elem, function (e) {
    return Traverse.parent(e).exists(function (p) {
      return Compare.eq(p, table);
    });
  });
};

interface Simulated {
  start: () => Element;
  finish: () => Element;
  range: () => SimRange;
}

// Note: initial is the finishing element, because that's where the cursor starts from
// Anchor is the starting element, and is only used to work out if we are in the same table
const simulate = function (bridge: WindowBridge, isRoot: (e: Element) => boolean, direction: KeyDirection, initial: Element, anchor: Element) {
  return SelectorFind.closest(initial, 'td,th', isRoot).bind(function (start) {
    return SelectorFind.closest(start, 'table', isRoot).bind(function (table) {
      if (!inSameTable(anchor, table)) {
        return Option.none<Simulated>();
      }
      return TableKeys.handle(bridge, isRoot, direction).bind(function (range) {
        return SelectorFind.closest(range.finish(), 'td,th', isRoot).map<Simulated>(function (finish) {
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

const navigate = function (bridge: WindowBridge, isRoot: (e: Element) => boolean, direction: KeyDirection, initial: Element, anchor: Element, precheck: (initial: Element, isRoot: (e: Element) => boolean) => Option<Response>) {
  // Do not override the up/down keys on IE.
  if (PlatformDetection.detect().browser.isIE()) {
    return Option.none<Response>();
  } else {
    return precheck(initial, isRoot).orThunk(function () {
      return simulate(bridge, isRoot, direction, initial, anchor).map(function (info) {
        const range = info.range();
        return Response.create(
          Option.some(Util.makeSitus(range.start(), range.soffset(), range.finish(), range.foffset())),
          true
        );
      });
    });
  }
};

const firstUpCheck = function (initial: Element, isRoot: (e: Element) => boolean) {
  return SelectorFind.closest(initial, 'tr', isRoot).bind(function (startRow) {
    return SelectorFind.closest(startRow, 'table', isRoot).bind(function (table) {
      const rows = SelectorFilter.descendants(table, 'tr');
      if (Compare.eq(startRow, rows[0])) {
        return DomGather.seekLeft(table, function (element) {
          return CursorPosition.last(element).isSome();
        }, isRoot).map(function (last) {
          const lastOffset = Awareness.getEnd(last);
          return Response.create(
            Option.some(Util.makeSitus(last, lastOffset, last, lastOffset)),
            true
          );
        });
      } else {
        return Option.none<Response>();
      }
    });
  });
};

const lastDownCheck = function (initial: Element, isRoot: (e: Element) => boolean) {
  return SelectorFind.closest(initial, 'tr', isRoot).bind(function (startRow) {
    return SelectorFind.closest(startRow, 'table', isRoot).bind(function (table) {
      const rows = SelectorFilter.descendants(table, 'tr');
      if (Compare.eq(startRow, rows[rows.length - 1])) {
        return DomGather.seekRight(table, function (element) {
          return CursorPosition.first(element).isSome();
        }, isRoot).map(function (first) {
          return Response.create(
            Option.some(Util.makeSitus(first, 0, first, 0)),
            true
          );
        });
      } else {
        return Option.none<Response>();
      }
    });
  });
};

const select = function (bridge: WindowBridge, container: Element, isRoot: (e: Element) => boolean, direction: KeyDirection, initial: Element, anchor: Element, selectRange: (container: Element, boxes: Element[], start: Element, finish: Element) => void) {
  return simulate(bridge, isRoot, direction, initial, anchor).bind(function (info) {
    return KeySelection.detect(container, isRoot, info.start(), info.finish(), selectRange);
  });
};

export {
  navigate,
  select,
  firstUpCheck,
  lastDownCheck
};
