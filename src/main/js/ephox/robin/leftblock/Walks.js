define(
  'ephox.robin.leftblock.Walks',

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.gather.Walker'
  ],

  function (Option, Walker) {
    var top = {
      rules: [
        { current: Walker.backtrack, next: Walker.sidestep, fallback: Option.none() },
        { current: Walker.sidestep, next: Walker.sidestep, fallback: Option.some(Walker.backtrack) },
        { current: Walker.advance, next: Walker.sidestep, fallback: Option.some(Walker.sidestep) }
      ],
      inclusion: function (universe, next, item) {
        // You can't just check the mode, because it may have fallen back to backtracking, 
        // even though mode was sidestep. Therefore, to see if a node is something that was
        // the parent of a previously traversed item, we have to do this. Very hacky... find a 
        // better way.
        var isParent = universe.property().parent(item).exists(function (p) {
          return universe.eq(p, next.item());
        });
        return !isParent;
      }
    };

    var all = {
      // rules === undefined, so use default.
      inclusion: function (universe, next, item) {
        return universe.property().isText(next.item());
      }
    };

    return {
      top: top,
      all: all
    };
  }
);