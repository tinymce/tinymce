define(
  'ephox.polaris.parray.Query',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option'
  ],

  function (Arr, Option) {
    var get = function (parray, offset) {
      var unit = Arr.find(parray, function (x) {
        return x.start() <= offset && x.finish() >= offset;
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

    var sublist = function (parray, start, finish) {
      var first = startindex(parray, start);
      var last = startindex(parray, finish);
      // var rawlast = index(parray, finish);
      // var last = rawlast > -1 ? rawlast ? tryend(parray, finish);



      
      // return first > -1 && last > -1 ? parray.slice(first, last) :
      //   finishes && first > -1 ? parray.slice()
      var r = first > -1 && last >- 1 ? parray.slice(first, last) :
        parray[parray.length - 1] && parray[parray.length - 1].finish() === finish && first > -1 ? parray.slice(first) : [];

      return r;
    };

    return {
      get: get,
      sublist: sublist
    };
  }
);
