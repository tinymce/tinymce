define(
  'ephox.robin.words.BoundedCluster',

  [
    'ephox.perhaps.Option',
    'ephox.robin.api.general.Parent',
    'ephox.robin.words.LanguageZones',
    'ephox.robin.words.ZoneWalker',
    'ephox.robin.words.Zones'
  ],

  function (Option, Parent, LanguageZones, ZoneWalker, Zones) {
    var rangeOn = function (universe, first, last, envLang) {
      var ancestor = universe.eq(first, last) ? Option.some(first) : universe.property().parent(first);
      return ancestor.map(function (parent) {
        var defaultLang = LanguageZones.getDefault(universe, parent).getOr(envLang);
        return ZoneWalker.walk(universe, first, last, defaultLang);
      });
    };

    var scour = function (universe, start, finish, envLang) {
      var groups = Parent.subset(universe, start, finish).bind(function (children) {
        if (children.length === 0) return Option.none();
        var first = children[0];
        var last = children[children.length - 1];
        return rangeOn(universe, first, last, envLang);
      }).getOr([ ]);

      return Zones.fromWalking(universe, groups);
    };

    return {
      scour: scour
    };
  }
);