define(
  'ephox.robin.api.general.SmartSelect',

  [
    'ephox.robin.smartselect.Selection'
  ],

  function (Selection) {
    var word = function (universe, item, offset, optimise) {
      return Selection.word(universe, item, offset, optimise);
    };

    return {
      word: word
    };
  }
);
