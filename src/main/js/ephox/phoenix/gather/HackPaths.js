define(
  'ephox.phoenix.gather.HackPaths',

  [
    'ephox.phoenix.gather.Hacksy',
    'ephox.scullion.Struct'
  ],

  function (Hacksy, Struct) {
    var sss = Struct.immutable('item', 'start', 'finish');
    var decision = Struct.immutable('items', 'abort');

    var all = function (universe, item) {
      return sss(item, 0, universe.property().getText(item).length);
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
        return decision([ sss(item, 0, text.length) ], false);
      }, function (splits) {
        var items = splits[0] === splits[1] ? [] : [ sss(item, splits[0], splits[1]) ];
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
      var initial = universe.property().isText(item) ? [ all(universe, item) ] : [];

      var next = Hacksy.go(universe, item, mode, direction);
      var rest = next.map(function (n) {
        var info = decider(universe, n.item(), direction);
        var recursive = info.abort() ? [] : doWords(universe, n.item(), n.mode(), direction);
        return info.items().concat(recursive);
      }).getOr([]);

console.log('dierction: ', direction);
      return direction.concat(initial, rest);
    };

    var words = function (universe, item, direction) {
      return doWords(universe, item, Hacksy.advance, direction);
    };

    return {
      words: words
    };
  }
);