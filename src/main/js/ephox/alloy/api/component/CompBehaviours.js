define(
  'ephox.alloy.api.component.CompBehaviours',

  [
    'ephox.alloy.behaviour.common.BehaviourBlob',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Obj',
    'global!Error'
  ],

  function (BehaviourBlob, Objects, Arr, Obj, Error) {
    var getBehaviours = function (spec) {
      var behaviours = Objects.readOptFrom(spec, 'behaviours').getOr({ });
      var keys = Arr.filter(
        Obj.keys(behaviours),
        function (k) { return behaviours[k] !== undefined; }
      );
      return Arr.map(keys, function (k) {
        return spec.behaviours[k].me;
      });
    };

    var generateFrom = function (spec, all) {
      return BehaviourBlob.generateFrom(spec, all);
    };

    var generate = function (spec) {
      var all = getBehaviours(spec);
      return generateFrom(spec, all);
    };

    return {
      generate: generate,
      generateFrom: generateFrom
    };
  }
);
