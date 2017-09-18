define(
  'ephox.boss.mutant.Tracks',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Option'
  ],

  function (Arr, Merger, Option) {
    var track = function (current, parent) {
      var r = Merger.deepMerge(current, {
        parent: parent
      });

      r.children = Arr.map(current.children || [], function (child) {
        // NOTE: The child must link to the new one being created (r)
        return track(child, Option.some(r));
      });

      return r;
    };

    return {
      track: track
    };
  }
);
