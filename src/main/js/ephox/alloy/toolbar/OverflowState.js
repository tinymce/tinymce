define(
  'ephox.alloy.toolbar.OverflowState',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.scullion.Cell'
  ],

  function (Fun, Option, Cell) {
    return function () {
      var groups = Cell(Option.none());

      var drawer = Cell(Option.none());

      var button = Cell(Option.none());

      return {
        groups: Fun.constant(groups),
        drawer: Fun.constant(drawer),
        button: Fun.constant(button)
      };
    };
  }
);