define(
  'ephox.robin.api.dom.DomSmartSelect',

  [
    'ephox.robin.api.general.SmartSelect'
  ],

  function (SmartSelect) {
    var word = function (element, offset) {
      return SmartSelect.word(universe, element, offset);
    };

    return {
      word: word
    };
  }
);
