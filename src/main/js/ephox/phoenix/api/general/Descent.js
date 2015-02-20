define(
  'ephox.phoenix.api.general.Descent',

  [
    'ephox.phoenix.wrap.Navigation'
  ],

  function (Navigation) {
    var toLeaf = function (unviverse, element, offset) {
      return Navigation.toLeaf(unviverse, element, offset);
    };

    return {
      toLeaf: toLeaf
    };
  }
);