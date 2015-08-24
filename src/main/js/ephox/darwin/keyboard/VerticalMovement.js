define(
  'ephox.darwin.keyboard.VerticalMovement',

  [
    'ephox.darwin.api.Responses',
    'ephox.darwin.keyboard.KeySelection',
    'ephox.darwin.keyboard.TableKeys',
    'ephox.fred.PlatformDetection',
    'ephox.fussy.api.SelectionRange',
    'ephox.fussy.api.Situ',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.PredicateExists',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Traverse'
  ],

  function (Responses, KeySelection, TableKeys, PlatformDetection, SelectionRange, Situ, Fun, Option, Compare, PredicateExists, SelectorFind, Traverse) {
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
      return SelectorFind.closest(initial, 'td,th').bind(function (start) {
        return SelectorFind.closest(start, 'table').bind(function (table) {
          if (!inSameTable(anchor, table)) return Option.none();
          return TableKeys.handle(bridge, isRoot, direction).bind(function (range) {
            return SelectorFind.closest(range.finish(), 'td,th').map(function (finish) {
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
      // Do not override the up/down keys on Firefox or IE.
      if (detection.browser.isFirefox() || detection.browser.isIE()) return Option.none();
      return simulate(bridge, isRoot, direction, initial, anchor).map(function (info) {
        var range = info.range();
        return Responses.response(
          Option.some(SelectionRange.write(
            Situ.on(range.start(), range.soffset()),
            Situ.on(range.finish(), range.foffset())
          )),
          true
        );
      });
    };

    var select = function (bridge, container, isRoot, direction, initial, anchor) {
      return simulate(bridge, isRoot, direction, initial, anchor).bind(function (info) {
        return KeySelection.detect(container, isRoot, info.start(), info.finish());
      });
    };

    return {
      navigate: navigate,
      select: select
    };
  }
);