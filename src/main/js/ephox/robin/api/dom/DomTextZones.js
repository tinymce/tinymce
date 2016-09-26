define(
  'ephox.robin.api.dom.DomTextZones',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.robin.api.general.TextZones'
  ],

  function (DomUniverse, TextZones) {
    var universe = DomUniverse();

    var single = function (element, envLang) {
      return TextZones.single(universe, element, envLang);
    };

    var range = function (start, soffset, finish, foffset, envLang) {
      return TextZones.range(universe, start, soffset, finish, foffset, envLang);
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