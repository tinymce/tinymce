define(
  'ephox.phoenix.util.node.Range',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.phoenix.extract.Extract',
    'ephox.phoenix.util.node.Parents',
    'ephox.sugar.api.Compare'
  ],

  function (Arr, Fun, Extract, Parents, Compare) {

    var curry = Fun.curry;
    
    var range = function (e1, e2) {
      if (e1 === e2) return [e1];
      var parent = Parents.common(e1, e2);
      return parent.fold(function () {
        return [];
      }, function (v) {

        var nodes = Arr.bind(Extract.from(v), function (x) {
          var no = Fun.constant([]);
          return x.fold(no, no, Fun.identity);
        });

        var i1 = Arr.findIndex(nodes, curry(Compare.eq, e1));
        var i2 = Arr.findIndex(nodes, curry(Compare.eq, e2));

        return nodes.slice(i1, i2 + 1);
      });
    };

    return {
      range: range
    };

  }
);
