define(
  'ephox.phoenix.gather.HackPaths',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.phoenix.api.general.Extract',
    'ephox.phoenix.gather.Hacksy',
    'ephox.scullion.Struct'
  ],

  function (Arr, Fun, Extract, Hacksy, Struct) {
    var sss = Struct.immutable('item', 'start', 'finish', 'text');
    var decision = Struct.immutable('items', 'abort');

    var all = function (universe, item) {
      var text = universe.property().getText(item);
      return sss(item, 0, text.length, text);
    };

    var onEdge = function (universe, item, direction) {
      return decision([], true);
    };

    var onOther = function (universe, item, direction) {
      return decision([], false);
    };

    var onText = function (universe, item, direction) {
      var text = universe.property().getText(item);
      return direction.substring(text).fold(function () {
        return decision([ sss(item, 0, text.length, text) ], false);
      }, function (splits) {
        var items = splits[0] === splits[1] ? [] : [ sss(item, splits[0], splits[1], text.substring(splits[0], splits[1])) ];
        return decision(items, true);
      });
    };

    var decider = function (universe, item, direction) {
      var f = (function () {
        if (universe.property().isBoundary(item)) return onEdge
        else if (universe.property().isEmptyTag(item)) return onEdge;
        else if (universe.property().isText(item)) return onText;
        else return onOther;
      })();
      return f(universe, item, direction);
    };

    /*
     * Identification of words:
     *
     * - if we start on a text node, include it and advance in the appropriate direction
     * - if we don't start on a text node, advance but don't include the current node.
     *
     * For boundaries, stop the gathering process and do not include
     * For empty tags, stop the gathering process and do not include
     * For text nodes:
     *   a) text node has a character break, stop the gathering process and include partial
     *   b) text node has no character breaks, keep gathering and include entire node
     * For others, keep gathering and do not include
     */
    var doWords = function (universe, item, mode, direction) {
      var next = Hacksy.go(universe, item, mode, direction);
      return next.map(function (n) {
        var info = decider(universe, n.item(), direction);
        var recursive = info.abort() ? [] : doWords(universe, n.item(), n.mode(), direction);
        return info.items().concat(recursive);
      }).getOr([]);
    };

    var extract = function (universe, item) {
      if (universe.property().isText(item)) return [ all(universe, item) ];
      var children = Extract.all(universe, item);
      return Arr.bind(children, function (ch) {
        return universe.property().isText(ch) ? [ all(universe, ch) ] : [];
      });
    }

    var words = function (universe, item) {
      var toLeft = doWords(universe, item, Hacksy.sidestep, Hacksy.left());
      var toRight = doWords(universe, item, Hacksy.sidestep, Hacksy.right());
      var middle = extract(universe, item);
      return {
        all: Fun.constant(Arr.reverse(toLeft).concat(middle).concat(toRight)),
        left: Fun.constant(toLeft),
        middle: Fun.constant(middle),
        right: Fun.constant(toRight)
      };
    };

    return {
      words: words
    };
  }
);