define(
  'ephox.agar.arbitrary.GenSelection',

  [
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.search.PredicateFilter',
    'ephox.sugar.api.node.Text',
    'ephox.sugar.api.search.Traverse',
    'ephox.wrap-jsverify.Jsc',
    'global!Math'
  ],

  function (Merger, Fun, Node, PredicateFilter, Text, Traverse, Jsc, Math) {
    var defaultExclusions = {
      containers: Fun.constant(false)
      /* Maybe support offsets later if it makes sense to do so */
    };

    var getEnd = function (target) {
      // Probably do this more efficiently
      return Node.isText(target) ? Text.get(target).length : Traverse.children(target).length;
    };

    var gChooseIn = function (target) {
      var offsets = getEnd(target);
      return Jsc.integer(0, offsets).generator.map(function (offset) {
        return { element: target, offset: offset };
      });      
    };

    var gChooseFrom = function (root, exclusions) {
      var self = exclusions.containers(root) ? [ ] : [ root ];
      var everything = PredicateFilter.descendants(root, Fun.not(exclusions.containers)).concat(self);
      return Jsc.elements(everything.length > 0 ? everything : [ root ]).generator.flatMap(gChooseIn);
    };

    var selection = function (root, rawExclusions) {
      var exclusions = Merger.deepMerge(defaultExclusions, rawExclusions);
      return gChooseFrom(root, exclusions).flatMap(function (start) {
        return gChooseFrom(root, exclusions).map(function (finish) {
          return {
            start: Fun.constant(start.element),
            soffset: Fun.constant(start.offset),
            finish: Fun.constant(finish.element),
            foffset: Fun.constant(finish.offset)
          };
        });
      });
    };

    return {
      selection: selection
    };
  }
);