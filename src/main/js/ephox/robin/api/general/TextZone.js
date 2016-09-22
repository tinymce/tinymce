define(
  'ephox.robin.api.general.TextZone',

  [
    'ephox.phoenix.api.general.Descent',
    'ephox.robin.zone.TextZone'
  ],

  function (Descent, TextZone) {
    // Cluster out from a single point, enforcing one language
    var single = function (universe, element, envLang, onlyLang) {
      // console.log('single', element.dom());
      if (universe.property().isBoundary(element)) return TextZone.fromBounded(universe, element, element, envLang, onlyLang);
      else if (universe.property().isEmptyTag(element)) return TextZone.empty();
      else return TextZone.fromInline(universe, element, envLang, onlyLang);
    };

    // Cluster out from a range, enforcing one language.
    var range = function (universe, start, soffset, finish, foffset, envLang, onlyLang) {
      var startPt = Descent.toLeaf(universe, start, soffset);
      var finishPt = Descent.toLeaf(universe, finish, foffset);
      // Probably have to do some gathering here.
      if (universe.eq(startPt.element(), finishPt.element())) return single(universe, startPt.element(), envLang, onlyLang);      
      return TextZone.fromRange(universe, startPt.element(), finishPt.element(), envLang, onlyLang);
    };

    return {
      single: single,
      range: range
    };
  }
);