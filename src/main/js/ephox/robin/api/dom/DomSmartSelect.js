define(
  'ephox.robin.api.dom.DomSmartSelect',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.robin.api.general.SmartSelect'
  ],

  function (DomUniverse, SmartSelect) {
    var universe = DomUniverse();

    var word = function (element, offset, optimise) {
      return SmartSelect.word(universe, element, offset, optimise);
    };

    return {
      word: word
    };
  }
);
