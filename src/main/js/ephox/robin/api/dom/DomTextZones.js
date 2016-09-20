define(
  'ephox.robin.api.dom.DomTextZones',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.robin.api.general.TextZones'
  ],

  function (DomUniverse, TextZones) {
    var universe = DomUniverse();

    var single = function (element) {
      return TextZones.single(universe, element);
    };

    var range = function (start, soffset, finish, foffset) {
      return TextZones.range(universe, start, soffset, finish, foffset);
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