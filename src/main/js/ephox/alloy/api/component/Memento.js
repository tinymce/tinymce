define(
  'ephox.alloy.api.component.Memento',

  [
    'ephox.alloy.registry.Tagger',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Option'
  ],

  function (Tagger, Objects, Merger, Option) {
    var record = function (spec) {
      var uid = Objects.hasKey(spec, 'uid') ? spec.uid : Tagger.generate('memento');

      var get = function (any) {
        return any.getSystem().getByUid(uid).getOrDie();
      };

      var getOpt = function (any) {
        return any.getSystem().getByUid(uid).fold(Option.none, Option.some);
      };

      var asSpec = function () {
        return Merger.deepMerge(spec, {
          uid: uid
        });
      };

      return {
        get: get,
        getOpt: getOpt,
        asSpec: asSpec
      };
    };

    return {
      record: record
    };
  }
);