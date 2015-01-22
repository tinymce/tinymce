define(
  'ephox.robin.smartselect.Selection',

  [
    'ephox.perhaps.Option',
    'ephox.robin.smartselect.EndofWord',
    'ephox.robin.util.CurrentWord'
  ],

  function (Option, EndofWord, CurrentWord) {
    /*  Given an initial position (item, offset), identify the optional selection range which represents the 
     *  word that (item, offset) is on. The start of the word and the end of the word is NOT considered
     *  on that word. Returns none if no word can be identified containing offset.
     */
    var word = function (universe, item, offset) {
      if (!universe.property().isText(item)) return Option.none();      
      var text = universe.property().getText(item);

      // Identify the index of a word break before the current offset and after the current offset
      // if possible.
      var breaks = CurrentWord.around(text, offset);

      return breaks.before().fold(function () {
        return breaks.after().fold(function () {
          return EndofWord.neither(universe, item, offset);
        }, function (a) {
          return EndofWord.after(universe, item, offset, a);
        });
      }, function (b) {
        return breaks.after().fold(function () {
          return EndofWord.before(universe, item, offset, b);
        }, function (a) {
          return EndofWord.both(universe, item, offset, b, a);
        });
      });
    };

    return {
      word: word
    };
  }
);
