/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const SWIPING_LEFT = 1;
const SWIPING_RIGHT = -1;
const SWIPING_NONE = 0;

/* The state is going to record the edge points before the direction changed. We can then use
 * these points to identify whether or not the swipe was *consistent enough*
 */

const init = function (xValue) {
  return {
    xValue,
    points: [ ]
  };
};

const move = function (model, xValue) {
  if (xValue === model.xValue) {
    return model; // do nothing.
  }

  // If the direction is the same as the previous direction, the change the last point
  // in the points array (because we have a new edge point). If the direction is different,
  // add a new point to the points array (because we have changed direction)
  const currentDirection = xValue - model.xValue > 0 ? SWIPING_LEFT : SWIPING_RIGHT;

  const newPoint = { direction: currentDirection, xValue };

  const priorPoints = (function () {
    if (model.points.length === 0) {
      return [ ];
    } else {
      const prev = model.points[model.points.length - 1];
      return prev.direction === currentDirection ? model.points.slice(0, model.points.length - 1) : model.points;
    }
  })();

  return {
    xValue,
    points: priorPoints.concat([ newPoint ])
  };
};

const complete = function (model/*, snaps*/) {
  if (model.points.length === 0) {
    return SWIPING_NONE;
  } else {
    // Preserving original intention
    const firstDirection = model.points[0].direction;
    const lastDirection = model.points[model.points.length - 1].direction;
    // eslint-disable-next-line no-nested-ternary
    return firstDirection === SWIPING_RIGHT && lastDirection === SWIPING_RIGHT ? SWIPING_RIGHT :
      firstDirection === SWIPING_LEFT && lastDirection === SWIPING_LEFT ? SWIPING_LEFT : SWIPING_NONE;
  }
};

export default {
  init,
  move,
  complete
};