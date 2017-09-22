define(
  'ephox.darwin.keyboard.VerticalMovement',

  [
    'ephox.darwin.api.Responses',
    'ephox.darwin.keyboard.KeySelection',
    'ephox.darwin.keyboard.TableKeys',
    'ephox.darwin.selection.Util',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.search.SelectorFind',
    'ephox.sugar.api.search.Traverse',
    'ephox.syrup.api.PredicateExists'
  ],

  function (Responses, KeySelection, TableKeys, Util, Fun, Option, PlatformDetection, Compare, SelectorFind, Traverse, PredicateExists) {
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

    var navigate = function (bridge, isRoot, direction, initial, anchor) {
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

    var select = function (bridge, container, isRoot, direction, initial, anchor, selectRange) {
      return simulate(bridge, isRoot, direction, initial, anchor).bind(function (info) {
        return KeySelection.detect(container, isRoot, info.start(), info.finish(), selectRange);
      });
    };

    return {
      navigate: navigate,
      select: select
    };
  }
);