define(
  'ephox.robin.api.general.TextZones',

  [
    'ephox.phoenix.api.general.Descent',
    'ephox.robin.zone.TextZones'
  ],

  function (Descent, TextZones) {
    /*
     * TextZones return an array of zones based on an area being scanned
     */
    var single = function (universe, element, envLang) {
      if (universe.property().isBoundary(element)) return TextZones.fromBounded(universe, element, element, envLang);
      else if (universe.property().isEmptyTag(element)) return empty();
      else return TextZones.fromInline(universe, element, envLang);
    };

    // NOTE: this is duplicated with TextZone, but I think if we try and reuse it it will become
    // unreadable.
    var range = function (universe, start, soffset, finish, foffset, envLang) {
      var startPt = Descent.toLeaf(universe, start, soffset);
      var finishPt = Descent.toLeaf(universe, finish, foffset);
      if (universe.eq(startPt.element(), finishPt.element())) return single(universe, startPt.element(), envLang);      
      return TextZones.fromRange(universe, startPt.element(), finishPt.element(), envLang);
    };

    var empty = function () {
      return TextZones.empty();
    };

    return {
      single: single,
      range: range,
      empty: empty
    };
  }
);