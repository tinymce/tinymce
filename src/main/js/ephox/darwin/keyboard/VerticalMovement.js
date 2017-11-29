define(
  'ephox.darwin.keyboard.VerticalMovement',

  [
    'ephox.darwin.api.Responses',
    'ephox.darwin.keyboard.KeySelection',
    'ephox.darwin.keyboard.TableKeys',
    'ephox.darwin.selection.Util',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.search.PredicateExists',
    'ephox.sugar.api.search.SelectorFilter',
    'ephox.sugar.api.search.SelectorFind',
    'ephox.sugar.api.search.Traverse',
    'ephox.sugar.api.selection.Awareness',
    'ephox.sugar.api.selection.CursorPosition'
  ],

  function (
    Responses, KeySelection, TableKeys, Util, Arr, Fun, Option, PlatformDetection, Compare, PredicateExists, SelectorFilter, SelectorFind, Traverse, Awareness,
    CursorPosition
  ) {
    var detection = PlatformDetection.detect();

    var inSameTable = function (elem, table) {
      return PredicateExists.ancestor(elem, function (e) {
        return Traverse.parent(e).exists(function (p) {
          return Compare.eq(p, table);
        });
      });
    };

    // Note: initial is the finishing element, because that's where the cursor starts from
    // Anchor is the starting element, and is only used to work out if we are in the same table
    var simulate = function (bridge, isRoot, direction, initial, anchor) {
      return SelectorFind.closest(initial, 'td,th', isRoot).bind(function (start) {
        return SelectorFind.closest(start, 'table', isRoot).bind(function (table) {
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
      var check = precheck(initial, isRoot);
      if (check.isSome()) return check;
      // Do not override the up/down keys on IE.
      if (detection.browser.isIE()) return Option.none();
      return simulate(bridge, isRoot, direction, initial, anchor).map(function (info) {
        var range = info.range();
        return Responses.response(
          Option.some(Util.makeSitus(range.start(), range.soffset(), range.finish(), range.foffset())),
          true
        );
      });
    };

    var firstUpCheck = function (initial, isRoot) {
      return SelectorFind.closest(initial, 'tr', isRoot).bind(function (startRow) {
        return SelectorFind.closest(startRow, 'table', isRoot).bind(function (table) {
          var rows = SelectorFilter.descendants(table, 'tr');
          if (Compare.eq(startRow, rows[0])) {
            return Traverse.prevSibling(table).bind(CursorPosition.last).map(function (last) {
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
            return Traverse.nextSibling(table).bind(CursorPosition.first).map(function (first) {
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

    return {
      navigate: navigate,
      select: select,
      firstUpCheck: firstUpCheck,
      lastDownCheck: lastDownCheck
    };
  }
);