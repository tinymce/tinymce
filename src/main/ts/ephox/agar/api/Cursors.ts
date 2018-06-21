import Chain from './Chain';
import { Result } from '@ephox/katamari';
import { Struct } from '@ephox/katamari';
import { Hierarchy, Element } from '@ephox/sugar';

export interface CursorRange {
  start: () => Element;
  soffset: () => number;
  finish: () => Element;
  foffset: () => number;
};

export interface CursorPath {
  startPath: () => number[];
  soffset: () => number;
  finishPath: () => number[];
  foffset: () => number;
};

type RangeConstructor = (obj: { start: Element; soffset: number; finish: Element; foffset: number; }) => CursorRange;

var range: RangeConstructor = Struct.immutableBag([ 'start', 'soffset', 'finish', 'foffset' ], [ ]);

type PathConstructor = (obj: { startPath: number[]; soffset: number; finishPath: number[]; foffset: number; }) => CursorPath;

var path: PathConstructor = Struct.immutableBag([ 'startPath', 'soffset', 'finishPath', 'foffset' ], [ ]);

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

var follow = function (container: Element, calcPath: number[]): Result<Element, string> {
  return Hierarchy.follow(container, calcPath).fold(function () {
    return Result.error('Could not follow path: ' + calcPath.join(','));
  }, function (p) {
    return Result.value(p);
  });
};

var followPath = function (container: Element, calcPath: CursorPath) {
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

var cFollowPath = function (calcPath: CursorPath) {
  return Chain.binder(function (container: Element) {
    return followPath(container, calcPath);
  });
};

var cFollowCursor = function (elementPath: number[], offset: number) {
  return Chain.binder(function (container: Element) {
    return follow(container, elementPath).map(function (element) {
      return range({
        start: element,
        soffset: offset,
        finish: element,
        foffset: offset
      });
    });
  });
};

var cFollow = function (elementPath: number[]) {
  return Chain.binder(function (container: Element) {
    return follow(container, elementPath);
  });
};

var cToRange = Chain.mapper(range);
var cToPath = Chain.mapper(path);

var calculate = function (container: Element, calcPath: CursorPath) {
  return followPath(container, calcPath).getOrDie();
};

var calculateOne = function (container: Element, calcPath: number[]) {
  return follow(container, calcPath).getOrDie();
};

export default {
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