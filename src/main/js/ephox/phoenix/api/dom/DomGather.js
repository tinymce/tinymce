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

    var before = function (element) {
      return Gather.before(universe, element);
    };

    var after = function (element) {
      return Gather.after(universe, element);
    };

    return {
      gather: gather,
      before: before,
      after: after
    };
  }
);
