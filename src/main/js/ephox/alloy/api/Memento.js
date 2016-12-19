define(
  'ephox.alloy.api.Memento',

  [
    'ephox.alloy.registry.Tagger',
    'ephox.boulder.api.Objects',
    'ephox.highway.Merger'
  ],

  function (Tagger, Objects, Merger) {
    var record = function (spec) {
      var uid = Objects.hasKey(spec, 'uid') ? spec.uid : Tagger.generate('memento');

      var get = function (any) {
        return any.getSystem().getByUid(uid).getOrDie();
      };

      var asSpec = function () {
        return Merger.deepMerge(spec, {
          uid: uid
        });
      };

      return {
        get: get,
        asSpec: asSpec
      };
    };

    return {
      record: record
    };
  }
);