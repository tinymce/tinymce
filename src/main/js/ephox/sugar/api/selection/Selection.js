define(
  'ephox.sugar.api.selection.Selection',

  [
    'ephox.katamari.api.Adt',
    'ephox.katamari.api.Struct',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.Traverse',
    'ephox.sugar.api.selection.Situ'
  ],

  function (Adt, Struct, Element, Traverse, Situ) {
    // Consider adding a type for "element"
    var type = Adt.generate([
      { domRange: [ 'rng' ] },
      { relative: [ 'startSitu', 'finishSitu' ] },
      { exact: [ 'start', 'soffset', 'finish', 'foffset' ] }
    ]);

    var range = Struct.immutable(
      'start',
      'soffset',
      'finish',
      'foffset'
    );

    var exactFromRange = function (simRange) {
      return type.exact(simRange.start(), simRange.soffset(), simRange.finish(), simRange.foffset());
    };

    var getStart = function (selection) {
      return selection.match({
        domRange: function (rng) {
          return Element.fromDom(rng.startContainer);
        },
        relative: function (startSitu, finishSitu) {
          return Situ.getStart(startSitu);
        },
        exact: function (start, soffset, finish, foffset) {
          return start;
        }
      });
    };

    var getWin = function (selection) {
      var start = getStart(selection);

      return Traverse.defaultView(start);
    };

    return {
      domRange: type.domRange,
      relative: type.relative,
      exact: type.exact,

      exactFromRange: exactFromRange,
      range: range,

      getWin: getWin
    };
  }
);
