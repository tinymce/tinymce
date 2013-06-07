define(
  'ephox.phoenix.api.general.Gather',

  [
    'ephox.phoenix.gather.Gather'
  ],

  function (Gather) {
    var gather = function (universe, element, prune, transform) {
      // not boss-ed yet.
      return Gather.gather(element, prune, transform);
    };

    return {
      gather: gather
    };
  }
);
