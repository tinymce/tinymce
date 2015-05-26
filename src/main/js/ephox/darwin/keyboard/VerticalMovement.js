define(
  'ephox.darwin.keyboard.VerticalMovement',

  [
    'ephox.darwin.api.Responses',
    'ephox.darwin.keyboard.KeySelection',
    'ephox.darwin.keyboard.TableKeys',
    'ephox.darwin.util.Logger',
    'ephox.fussy.api.SelectionRange',
    'ephox.fussy.api.Situ',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Responses, KeySelection, TableKeys, Logger, SelectionRange, Situ, Fun, Option, SelectorFind) {
    var simulate = function (bridge, isRoot, direction, initial) {
      return SelectorFind.closest(initial, 'td,th').bind(function (start) {
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
    };

    var navigate = function (bridge, isRoot, direction, initial) {
      return simulate(bridge, isRoot, direction, initial).map(function (info) {
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

    var select = function (bridge, container, isRoot, direction, initial) {
      return simulate(bridge, isRoot, direction, initial).bind(function (info) {
        return KeySelection.detect(container, isRoot, info.start(), info.finish());
      });
    };

    return {
      navigate: navigate,
      select: select
    };
  }
);