define(
  'ephox.robin.api.dom.DomTextZone',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.robin.api.general.TextZone'
  ],

  function (DomUniverse, TextZone) {
    var universe = DomUniverse();

    var single = function (element, envLang, onlyLang) {
      return TextZone.single(universe, element, envLang, onlyLang);
    };

    var range = function (start, soffset, finish, foffset, envLang, onlyLang) {
      return TextZone.range(universe, start, soffset, finish, foffset, envLang, onlyLang);
    };

    return {
      single: single,
      range: range
    };
  }
);