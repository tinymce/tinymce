define(
  'ephox.snooker.ready.lookup.TableLookup',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.snooker.ready.data.Structs',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind',
    'global!parseInt'
  ],

  function (Arr, Option, Structs, Attr, Node, SelectorFilter, SelectorFind, parseInt) {
    var lookup = function (tags, element) {
      return Arr.contains(tags, Node.name(element)) ? Option.some(element) : SelectorFind.ancestor(element, tags.join(','));
    };

    var cell = function (element) {
      return lookup([ 'td', 'th' ], element);
    };

    var cells = function (ancestor) {
      return SelectorFilter.descendants(ancestor, 'th,td');
    };

    var firstCell = function (ancestor) {
      return SelectorFind.descendant(ancestor, 'th,td');
    };

    var table = function (element) {
      return lookup([ 'table' ], element);
    };

    var row = function (element) {
      return lookup([ 'tr' ], element);
    };

    var rows = function (ancestor) {
      return SelectorFilter.descendants(ancestor, 'tr');
    };

    var attr = function (element, property) {
      return parseInt(Attr.get(element, property), 10);
    };

    var grid = function (element, rowProp, colProp) {
      var rows = attr(element, rowProp);
      var cols = attr(element, colProp);
      return Structs.grid(rows, cols);
    };

    return {
      cell: cell,
      firstCell: firstCell,
      cells: cells,
      table: table,
      row: row,
      rows: rows,
      attr: attr,
      grid: grid
    };
  }
);
