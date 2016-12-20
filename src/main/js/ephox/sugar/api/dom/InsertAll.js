define(
  'ephox.sugar.api.dom.InsertAll',

  [
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.dom.Insert'
  ],

  function (Arr, Insert) {
    var before = function (marker, elements) {
      Arr.each(elements, function (x) {
        Insert.before(marker, x);
      });
    };

    var after = function (marker, elements) {
      Arr.each(elements, function (x, i) {
        var e = i === 0 ? marker : elements[i - 1];
        Insert.after(e, x);
      });
    };

    var prepend = function (parent, elements) {
      Arr.each(elements.slice().reverse(), function (x) {
        Insert.prepend(parent, x);
      });
    };

    var append = function (parent, elements) {
      Arr.each(elements, function (x) {
        Insert.append(parent, x);
      });
    };

    return {
      before: before,
      after: after,
      prepend: prepend,
      append: append
    };
  }
);
