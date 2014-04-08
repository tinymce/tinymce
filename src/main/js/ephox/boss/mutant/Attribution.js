define(
  'ephox.boss.mutant.Attribution',

  [
    'ephox.highway.Merger'
  ],

  function (Merger) {
    var set = function (item, property, value) {
      var r = {};
      r[property] = value;
      item.attrs = Merger.merge(item.attrs !== undefined ? item.attrs : {}, r);
    };

    var get = function (item, property) {
      return item.attrs !== undefined && item.attrs[property] !== undefined ? item.attrs[property] : 0;
    };

    var remove = function (item, property) {
      var rest = Merger.merge({}, item.attrs);
      delete rest[property];
      item.attrs = rest;
    };

    return {
      get: get,
      set: set,
      remove: remove
    };
  }
);