define(
  'ephox.alloy.test.ChainUtils',

  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.Guard',
    'ephox.agar.api.NamedChain',
    'ephox.compass.Arr',
    'ephox.compass.Obj'
  ],

  function (Chain, Guard, NamedChain, Arr, Obj) {
    // Move to agar?
    var cLogging = function (label, chains) {
      var logChains = Arr.map(chains, function (c) {
        return Chain.control(c, Guard.addLogging(label));
      });

      return Chain.fromChains(logChains);
    };

    var cFindUid = function (uid) {
      return Chain.binder(function (context) {
        return context.getByUid(uid);
      });
    };

    var cFindUids = function (gui, lookups) {
      var keys = Obj.keys(lookups);
      var others = Arr.map(keys, function (k) {
        return NamedChain.direct('context', cFindUid(lookups[k]), k);
      });

      return NamedChain.asChain(
        [
          NamedChain.writeValue('context', gui)
        ].concat(others)
      );
    };

    var cStore = function (property) {
      return NamedChain.direct(property, Chain.inject, property);
    };

    return {
      cLogging: cLogging,
      cFindUids: cFindUids,
      cStore: cStore
    };
  }
);