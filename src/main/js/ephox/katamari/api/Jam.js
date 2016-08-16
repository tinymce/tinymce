define(
  'ephox.katamari.api.Jam',

  [
    'global!Object'
  ],

  function (Object) {

    var intersperseThunk = function (array, delimiterThunk) {
      if (array === undefined) throw 'Cannot intersperse undefined';
      if (array.length <= 1) return array;

      var r = [];

      r.push(array[0]);
      for (var i = 1; i < array.length; i ++) {
        r.push(delimiterThunk());
        r.push(array[i]);
      }
      return r;
    };

    var intersperse = function (array, delimiter) {
      var thunk = function () {
        return delimiter;
      };

      return intersperseThunk(array, thunk);
    };

    var tabulate = function(array) {
      var ret = {};
      for (var i = 0; i < array.length; i++) {
        var curObject = array[i];
        for (var key in curObject) if (Object.prototype.hasOwnProperty.call(curObject, key)) {
          var value = curObject[key];
          if (!Object.prototype.hasOwnProperty.call(ret, key)) ret[key] = [];
          ret[key][i] = value;
        }
      }
      return ret;
    };

    var untabulate = function(object) {
      var ret = [];
      for (var key in object) if (Object.prototype.hasOwnProperty.call(object, key)) {
        var curArray = object[key];
        for (var i = 0; i < curArray.length; i++) {
            var value = curArray[i];
            ret[i] = ret[i] || {};
            ret[i][key] = value;
        }
      }
      return ret;
    };

    return {
      intersperse: intersperse,
      intersperseThunk: intersperseThunk,
      untabulate: untabulate,
      tabulate: tabulate
    };
  }
);