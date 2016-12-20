define(
  'ephox.sugar.api.dom.DocumentPosition',

  [
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.search.Traverse'
  ],

  function (Compare, Traverse ) {
    var after = function (start, soffset, finish, foffset) {
      var doc = Traverse.owner(start);

      // TODO: Find a sensible place to put the native range creation code.
      var rng = doc.dom().createRange();
      rng.setStart(start.dom(), soffset);
      rng.setEnd(finish.dom(), foffset);

      var same = Compare.eq(start, finish) && soffset === foffset;
      return rng.collapsed && !same;
    };

    return {
      after: after
    };
  }
);