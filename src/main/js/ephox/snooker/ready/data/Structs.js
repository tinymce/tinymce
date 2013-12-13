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
    var detail = Struct.immutable('element', 'rowspan', 'colspan');
    var extended = Struct.immutable('element', 'rowspan', 'colspan', 'row', 'column');

    return {
      dimensions: dimensions,
      grid: grid,
      address: address,
      coords: coords,
      extended: extended,
      detail: detail
    };
  }
);