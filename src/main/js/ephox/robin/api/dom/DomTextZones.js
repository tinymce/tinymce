define(
  'ephox.robin.api.dom.DomTextZones',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.robin.api.general.TextZones'
  ],

  function (DomUniverse, TextZones) {
    var universe = DomUniverse();

    var single = function (element, envLang, viewport) {
      return TextZones.single(universe, element, envLang, viewport);
    };

    var range = function (start, soffset, finish, foffset, envLang, viewport) {
      return TextZones.range(universe, start, soffset, finish, foffset, envLang, viewport);
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