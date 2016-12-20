define(
  'ephox.agar.api.Cursors',

  [
    'ephox.agar.api.Chain',
    'ephox.katamari.api.Result',
    'ephox.katamari.api.Struct',
    'ephox.sugar.api.dom.Hierarchy'
  ],

  function (Chain, Result, Struct, Hierarchy) {
    var range = Struct.immutableBag([ 'start', 'soffset', 'finish', 'foffset' ], [ ]);
    var path = Struct.immutableBag([ 'startPath', 'soffset', 'finishPath', 'foffset' ], [ ]);

    var pathFromCollapsed = function (spec) {
      return path({
        startPath: spec.element,
        soffset: spec.offset,
        finishPath: spec.element,
        foffset: spec.offset
      });
    };

    var pathFromRange = function (spec) {
      var finish = spec.finish !== undefined ? spec.finish : spec.start;
      return path({
        startPath: spec.start.element,
        soffset: spec.start.offset,
        finishPath: finish.element,
        foffset: finish.offset
      });
    };

    var pathFrom = function (spec) {
      return spec.start === undefined && spec.element !== undefined ? pathFromCollapsed(spec) : pathFromRange(spec);
    };

    var follow = function (container, calcPath) {
      return Hierarchy.follow(container, calcPath).fold(function () {
        return Result.error('Could not follow path: ' + calcPath.join(','));
      }, function (p) {
        return Result.value(p);
      });
    };

    var followPath = function (container, calcPath) {
      return follow(container, calcPath.startPath()).bind(function (start) {
        return follow(container, calcPath.finishPath()).map(function (finish) {
          return range({
            start: start,
            soffset: calcPath.soffset(),
            finish: finish,
            foffset: calcPath.foffset()
          });
        });
      });
    };

    var cFollowPath = function (calcPath) {
      return Chain.binder(function (container) {
        return followPath(container, calcPath);
      });
    };

    var cFollowCursor = function (elementPath, offset) {
      return Chain.binder(function (container) {
        return follow(container, elementPath).bind(function (element) {
          return range({
            start: element,
            soffset: offset,
            finish: element,
            foffset: offset
          });
        });
      });
    };

    var cFollow = function (elementPath) {
      return Chain.binder(function (container) {
        return follow(container, elementPath);
      });
    };

    var cToRange = Chain.mapper(range);
    var cToPath = Chain.mapper(path);

    var calculate = function (container, calcPath) {
      return followPath(container, calcPath).getOrDie();
    };

    var calculateOne = function (container, calcPath) {
      return follow(container, calcPath).getOrDie();
    };

    return {
      range: range,
      path: path,
      pathFrom: pathFrom,
      
      cFollow: cFollow,
      cFollowPath: cFollowPath,
      cFollowCursor: cFollowCursor,
      cToRange: cToRange,
      cToPath: cToPath,

      calculate: calculate,
      calculateOne: calculateOne
    };
  }
);