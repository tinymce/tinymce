define(
  'ephox.alloy.api.Memento',

  [
    'ephox.alloy.registry.Tagger',
    'ephox.highway.Merger'
  ],

  function (Tagger, Merger) {
    var record = function (spec) {
      var uid = Tagger.generate('memento');

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