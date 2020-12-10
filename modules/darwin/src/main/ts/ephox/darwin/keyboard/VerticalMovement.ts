import { Optional } from '@ephox/katamari';
import { DomGather } from '@ephox/phoenix';
import { PlatformDetection } from '@ephox/sand';
import { Awareness, Compare, CursorPosition, PredicateExists, SelectorFilter, SelectorFind, SimRange, SugarElement, Traverse } from '@ephox/sugar';
import { WindowBridge } from '../api/WindowBridge';
import { KeyDirection } from '../navigation/KeyDirection';
import { Response } from '../selection/Response';
import * as Util from '../selection/Util';
import * as KeySelection from './KeySelection';
import * as TableKeys from './TableKeys';

interface Simulated {
  readonly start: SugarElement;
  readonly finish: SugarElement;
  readonly range: SimRange;
}

const inSameTable = (elem: SugarElement, table: SugarElement): boolean => {
  return PredicateExists.ancestor(elem, (e) => {
    return Traverse.parent(e).exists((p) => {
      return Compare.eq(p, table);
    });
  });
};

// Note: initial is the finishing element, because that's where the cursor starts from
// Anchor is the starting element, and is only used to work out if we are in the same table
const simulate = (bridge: WindowBridge, isRoot: (e: SugarElement) => boolean, direction: KeyDirection, initial: SugarElement, anchor: SugarElement): Optional<Simulated> => {
  return SelectorFind.closest(initial, 'td,th', isRoot).bind((start) => {
    return SelectorFind.closest(start, 'table', isRoot).bind((table) => {
      if (!inSameTable(anchor, table)) {
        return Optional.none<Simulated>();
      }
      return TableKeys.handle(bridge, isRoot, direction).bind((range) => {
        return SelectorFind.closest(range.finish, 'td,th', isRoot).map<Simulated>((finish) => {
          return {
            start,
            finish,
            range
          };
        });
      });
    });
  });
};

const navigate = (bridge: WindowBridge, isRoot: (e: SugarElement) => boolean, direction: KeyDirection, initial: SugarElement,
                  anchor: SugarElement, precheck: (initial: SugarElement, isRoot: (e: SugarElement) => boolean) => Optional<Response>): Optional<Response> => {
  // Do not override the up/down keys on IE.
  if (PlatformDetection.detect().browser.isIE()) {
    return Optional.none<Response>();
  } else {
    return precheck(initial, isRoot).orThunk(() => {
      return simulate(bridge, isRoot, direction, initial, anchor).map((info) => {
        const range = info.range;
        return Response.create(
          Optional.some(Util.makeSitus(range.start, range.soffset, range.finish, range.foffset)),
          true
        );
      });
    });
  }
};

const firstUpCheck = (initial: SugarElement, isRoot: (e: SugarElement) => boolean): Optional<Response> => {
  return SelectorFind.closest(initial, 'tr', isRoot).bind((startRow) => {
    return SelectorFind.closest(startRow, 'table', isRoot).bind((table) => {
      const rows = SelectorFilter.descendants(table, 'tr');
      if (Compare.eq(startRow, rows[0])) {
        return DomGather.seekLeft(table, (element) => {
          return CursorPosition.last(element).isSome();
        }, isRoot).map((last) => {
          const lastOffset = Awareness.getEnd(last);
          return Response.create(
            Optional.some(Util.makeSitus(last, lastOffset, last, lastOffset)),
            true
          );
        });
      } else {
        return Optional.none<Response>();
      }
    });
  });
};

const lastDownCheck = (initial: SugarElement, isRoot: (e: SugarElement) => boolean): Optional<Response> => {
  return SelectorFind.closest(initial, 'tr', isRoot).bind((startRow) => {
    return SelectorFind.closest(startRow, 'table', isRoot).bind((table) => {
      const rows = SelectorFilter.descendants(table, 'tr');
      if (Compare.eq(startRow, rows[rows.length - 1])) {
        return DomGather.seekRight(table, (element) => {
          return CursorPosition.first(element).isSome();
        }, isRoot).map((first) => {
          return Response.create(
            Optional.some(Util.makeSitus(first, 0, first, 0)),
            true
          );
        });
      } else {
        return Optional.none<Response>();
      }
    });
  });
};

const select = (bridge: WindowBridge, container: SugarElement, isRoot: (e: SugarElement) => boolean, direction: KeyDirection, initial: SugarElement,
                anchor: SugarElement, selectRange: (container: SugarElement, boxes: SugarElement[], start: SugarElement, finish: SugarElement) => void): Optional<Response> => {
  return simulate(bridge, isRoot, direction, initial, anchor).bind((info) => {
    return KeySelection.detect(container, isRoot, info.start, info.finish, selectRange);
  });
};

export {
  navigate,
  select,
  firstUpCheck,
  lastDownCheck
};
