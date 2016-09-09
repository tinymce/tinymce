define(
  'ephox.alloy.inline.state.InlineState',

  [
    'ephox.perhaps.Option',
    'ephox.scullion.Cell'
  ],

  function (Option, Cell) {
    return function () {
      var contents = Cell(Option.none());

      var set = function (s) {
        contents.set(Option.some(s));
      };

      var clear = function () {
        contents.set(Option.none());
      };

      var isClear = function () {
        return contents.get().isNone();
      };

      return {
        get: contents.get,
        set: set,
        clear: clear,
        isClear: isClear
      };
    };
  }
);