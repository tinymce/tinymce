define(
  'ephox.phoenix.api.dom.DomGather',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.api.general.Gather'
  ],

  function (DomUniverse, Gather) {
    var universe = DomUniverse();

    var gather = function (element, prune, transform) {
      return Gather.gather(universe, element, prune, transform);
    };

    var before = function (element, isRoot) {
      return Gather.before(universe, element, isRoot);
    };

    var after = function (element, isRoot) {
      return Gather.after(universe, element, isRoot);
    };

    return {
      gather: gather,
      before: before,
      after: after
    };
  }
);
