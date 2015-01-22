define(
  'ephox.robin.smartselect.EndofWord',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.robin.data.WordRange',
    'ephox.robin.words.Clustering'
  ],

  function (Fun, Option, WordRange, Clustering) {
    var toEnd = function (cluster, start, soffset) {
      if (cluster.length === 0) return Option.none();
      var last = cluster[cluster.length - 1];
      return Option.some(WordRange(start, soffset, last.item(), last.finish()));
    };

    var fromStart = function (cluster, finish, foffset) {
      if (cluster.length === 0) return Option.none();
      var first = cluster[0];
      return Option.some(WordRange(first.item(), first.start(), finish, foffset));
    };

    var all = function (cluster) {
      if (cluster.length === 0) return Option.none();
      var first = cluster[0];
      var last = cluster[cluster.length - 1];
      return Option.some(WordRange(first.item(), first.start(), last.item(), last.finish()));
    };

    var scan = function (universe, item, offset) {
      var text = universe.property().getText(item);
      var cluster = Clustering.words(universe, item);
      var atLeftEdge = offset === 0 && cluster.left().length === 0;
      var atRightEdge = offset === text.length && cluster.right().length === 0;
      return {
        all: cluster.all,
        leftEdge: Fun.constant(offset === 0 && cluster.left().length === 0),
        rightEdge: Fun.constant(offset === text.length && cluster.right().length === 0),
        text: Fun.constant(text)
      };
    };


    // There was only a break in the node before the current position, so
    // as long as we are not already at the right edge of the node AND cluster, we extend to the 
    // end of the cluster.
    var before = function (universe, item, offset, bindex) {
      var info = scan(universe, item, offset);
      return info.rightEdge() ? Option.none() : toEnd(info.all(), item, bindex);
    };

    // There was only a break in the node after the current position, so
    // as long as we are not already at the left edge of the node AND cluster, we extend from the
    // start of the cluster to the index.
    var after = function (universe, item, offset, aindex) {
      var info = scan(universe, item, offset);
      return info.leftEdge() ? Option.none() : fromStart(info.all(), item, aindex);
    };

    // We don't need to use the cluster, because we are in the middle of two breaks. Only return something 
    // if the breaks aren't at the same position.
    var both = function (universe, item, offset, bindex, aindex) {
      return bindex === aindex ? Option.none() : Option.some(WordRange(item, bindex, item, aindex));
    };

    // There are no breaks in the current node, so as long as we aren't at either edge of node/cluster, 
    // then we extend the length of the cluster.
    var neither = function (universe, item, offset) {
      var info = scan(universe, item, offset);
      return info.leftEdge() || info.rightEdge() ? Option.none() : all(info.all());
    };

    return {
      before: before,
      after: after,
      both: both,
      neither: neither
    };
  }
);
