define(
  'ephox.snooker.ready.data.Structs',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    var dimensions = Struct.immutable('width', 'height');
    var grid = Struct.immutable('rows', 'columns');
    var address = Struct.immutable('row', 'column');
    var coords = Struct.immutable('x', 'y');

    return {
      dimensions: dimensions,
      grid: grid,
      address: address,
      coords: coords
    };
  }
);