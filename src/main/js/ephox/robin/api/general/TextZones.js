define(
  'ephox.robin.api.general.TextZones',

  [
    'ephox.phoenix.api.general.Descent',
    'ephox.robin.zone.TextZones'
  ],

  function (Descent, TextZones) {
    var single = function (universe, element, envLang) {
      // console.log('single', element.dom());
      if (universe.property().isBoundary(element)) return TextZones.fromBounded(universe, element, element, envLang);
      else if (universe.property().isEmptyTag(element)) return empty();
      else return TextZones.fromInline(universe, element, envLang);
    };

    var range = function (universe, start, soffset, finish, foffset, envLang) {
      var startPt = Descent.toLeaf(universe, start, soffset);
      var finishPt = Descent.toLeaf(universe, finish, foffset);
      // Probably have to do some gathering here.
      if (universe.eq(startPt.element(), finishPt.element())) return single(universe, startPt.element(), envLang);      
      return TextZones.fromBounded(universe, startPt.element(), finishPt.element(), envLang);
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