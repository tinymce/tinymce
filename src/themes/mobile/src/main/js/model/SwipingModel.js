define(
  'tinymce.themes.mobile.model.SwipingModel',

  [

  ],

  function () {
    var SWIPING_LEFT = 1;
    var SWIPING_RIGHT = -1;
    var SWIPING_NONE = 0;

    /* The state is going to record the edge points before the direction changed. We can then use
     * these points to identify whether or not the swipe was *consistent enough*
     */

    var init = function (xValue) {
      return {
        xValue: xValue,
        points: [ ]
      };
    };

    var move = function (model, xValue) {
      if (xValue === model.xValue) {
        return model; // do nothing.
      }

      // If the direction is the same as the previous direction, the change the last point
      // in the points array (because we have a new edge point). If the direction is different,
      // add a new point to the points array (because we have changed direction)
      var currentDirection = xValue - model.xValue > 0 ? SWIPING_LEFT : SWIPING_RIGHT;

      var newPoint = { direction: currentDirection, xValue: xValue };

      var priorPoints = (function () {
        if (model.points.length === 0) {
          return [ ];
        } else {
          var prev = model.points[model.points.length - 1];
          return prev.direction === currentDirection ? model.points.slice(0, model.points.length - 1) : model.points;
        }
      })();

      return {
        xValue: xValue,
        points: priorPoints.concat([ newPoint ])
      };
    };

    var complete = function (model/*, snaps*/) {
      if (model.points.length === 0) {
        return SWIPING_NONE;
      } else {
        // Preserving original intention
        var firstDirection = model.points[0].direction;
        var lastDirection = model.points[model.points.length - 1].direction;
        // eslint-disable-next-line no-nested-ternary
        return firstDirection === SWIPING_RIGHT && lastDirection === SWIPING_RIGHT ? SWIPING_RIGHT :
          firstDirection === SWIPING_LEFT && lastDirection == SWIPING_LEFT ? SWIPING_LEFT : SWIPING_NONE;
      }
    };

    return {
      init: init,
      move: move,
      complete: complete
    };
  }
);