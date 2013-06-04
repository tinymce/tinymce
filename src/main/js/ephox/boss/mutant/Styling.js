define(
  'ephox.boss.mutant.Styling',

  [
    'ephox.highway.Merger'
  ],

  function (Merger) {
    var set = function (item, property, value) {
      var r = {};
      r[property] = value;
      item.css = Merger.merge(item.css !== undefined ? item.css : {}, r);
    };

    var get = function (item, property) {
      return item.css !== undefined && item.css[property] !== undefined ? item.css[property] : 0;
    };

    var remove = function (item, property) {
      var rest = Merger.merge({}, item.css);
      delete rest[property];
      item.css = rest;
    };

    return {
      get: get,
      set: set,
      remove: remove
    };
  }
);
