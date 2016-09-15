define(
  'ephox.robin.words.WordDecision',

  [
    'ephox.perhaps.Option',
    'ephox.scullion.Struct'
  ],

  function (Option, Struct) {
    var make = Struct.immutable('item', 'start', 'finish', 'text');
    var decision = Struct.immutable('items', 'abort');

    var detail = function (universe, item) {
      var text = universe.property().getText(item);
      return make(item, 0, text.length, text);
    };

    var onEdge = function (universe, item, slicer) {
      return decision([], true);
    };

    var onOther = function (universe, item, slicer) {
      return decision([], false);
    };

    // Returns: a 'decision' Struct with the items slot containing an empty array if None
    //   or  a zero-width [start, end] range was returned by slicer, or 1-element array of the
    //   [start, end] substring otherwise.
    var onText = function (universe, item, slicer) {
      var text = universe.property().getText(item);
      return slicer(text).fold(function () {
        return decision([ make(item, 0, text.length, text) ], false);
      }, function (splits) {
        var items = splits[0] === splits[1] ? [] : [ make(item, splits[0], splits[1], text.substring(splits[0], splits[1])) ];
        return decision(items, true);
      });
    };

    // Returns: true if currLang and the item 'lang' attribute are both the same string, or both are None.
    var isLanguageBoundary = function (universe, item, currLang) {
      return (universe.property().isElement(item) &&
        !Option.equals(currLang, Option.from(universe.attrs().get(item, 'lang'))));
    };

    // Return decision struct with one or zero 'make' Struct items. If present the make struct item is the entire item node text,
    // or a substring of it with the [left, right] bounds as determined by the result of slicer(item).
    // currLang is an Option(string) of the current item language, languageFun is a function 
    // to return an Option(string) of the language of an element.
    var decide = function (universe, item, slicer, currLang) {
      var f = (function () {
        // console.log('item', item, currLang.getOr('none'),Option.from(universe.attrs().get(item, 'lang')).getOr('none'), 'lBound:', isLanguageBoundary(universe, item, currLang));
        if (universe.property().isBoundary(item)) return onEdge;
        else if (universe.property().isEmptyTag(item)) return onEdge;
        else if (isLanguageBoundary(universe, item, currLang)) return onEdge;
        else if (universe.property().isText(item)) return onText;
        else return onOther;
      })();
      return f(universe, item, slicer);
    };

    return {
      detail: detail,
      decide: decide
    };
  }
);