define(
  'ephox.polaris.parray.Query',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option'
  ],

  function (Arr, Option) {

    /**
     * Simple "is position within unit" utility function
     */
    var inUnit = function (unit, position) {
      return position >= unit.start() && position <= unit.finish();
    };

    /**
     * Finds the unit in the PositionArray that contains this offset (if there is one)
     */
    var get = function (parray, offset) {
      var unit = Arr.find(parray, function (x) {
        return inUnit(x, offset);
      });

      return Option.from(unit);
    };

    var startindex = function (parray, offset) {
      return Arr.findIndex(parray, function (unit) {
        return unit.start() === offset;
      });
    };

    var tryend = function (parray, finish) {
      var finishes = parray[parray.length - 1] && parray[parray.length - 1].finish() === finish;
      return finishes ? parray.length + 1 : -1;
    };


    /**
     * Extracts the pieces of the PositionArray that are bounded *exactly* on the start and finish offsets
     */
    var sublist = function (parray, start, finish) {
      var first = startindex(parray, start);
      var rawlast = startindex(parray, finish);
      var last = rawlast > -1 ? rawlast : tryend(parray, finish);

      return first > -1 && last > -1 ? parray.slice(first, last) : [];
    };

    return {
      get: get,
      inUnit: inUnit,
      sublist: sublist
    };
  }
);
