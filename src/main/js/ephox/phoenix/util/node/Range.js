define(
  'ephox.phoenix.util.node.Range',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.phoenix.api.DomExtract',
    'ephox.phoenix.util.node.DomParents',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Node'
  ],

  function (Arr, Fun, DomExtract, DomParents, Compare, Node) {

    var curry = Fun.curry;
    
    var range = function (e1, e2) {
      if (Compare.eq(e1.element(), e2.element())) return [e1.element()];
      var parent = DomParents.common(e1.element(), e2.element());
      return parent.fold(function () {
        return [];
      }, function (v) {

        var nodes = Arr.bind(DomExtract.from(v), function (x) {
          var no = Fun.constant([]);
          return x.fold(no, Fun.identity, Fun.identity);
        });

        var i1 = Arr.findIndex(nodes, curry(Compare.eq, e1.element())) + e1.offset();
        var i2 = Arr.findIndex(nodes, curry(Compare.eq, e2.element())) + e2.offset();

        var result = nodes.slice(i1, i2);
        return Arr.filter(result, Node.isText);
      });
    };

    return {
      range: range
    };

  }
);
