define(
  'ephox.snooker.data.Structs',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    var dimensions = Struct.immutable('width', 'height');
    var grid = Struct.immutable('rows', 'columns');
    var cell = Struct.immutable('row', 'column');
    var xy = Struct.immutable('x', 'y');

    return {
      dimensions: dimensions,
      grid: grid,
      cell: cell,
      xy: xy
    };
  }
);
