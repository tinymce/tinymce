define(
  'ephox.robin.api.dom.DomSmartSelect',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.robin.api.general.SmartSelect'
  ],

  function (DomUniverse, SmartSelect) {
    var universe = DomUniverse();

    var word = function (element, offset) {
      return SmartSelect.word(universe, element, offset);
    };

    return {
      word: word
    };
  }
);
