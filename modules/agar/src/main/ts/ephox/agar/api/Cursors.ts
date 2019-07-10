import { Result, Struct } from '@ephox/katamari';
import { Element, Hierarchy } from '@ephox/sugar';

import { Chain } from './Chain';

export interface CursorRange {
  start: () => Element;
  soffset: () => number;
  finish: () => Element;
  foffset: () => number;
}

export interface CursorPath {
  startPath: () => number[];
  soffset: () => number;
  finishPath: () => number[];
  foffset: () => number;
}

type RangeConstructor = (obj: { start: Element; soffset: number; finish: Element; foffset: number; }) => CursorRange;

const range: RangeConstructor = Struct.immutableBag(['start', 'soffset', 'finish', 'foffset'], []);

type PathConstructor = (obj: { startPath: number[]; soffset: number; finishPath: number[]; foffset: number; }) => CursorPath;

const path: PathConstructor = Struct.immutableBag(['startPath', 'soffset', 'finishPath', 'foffset'], []);

export interface CursorSpec {
  element: number[];
  offset: number;
}

const pathFromCollapsed = function (spec: CursorSpec) {
  return path({
    startPath: spec.element,
    soffset: spec.offset,
    finishPath: spec.element,
    foffset: spec.offset
  });
};

export interface RangeSpec {
  start: CursorSpec;
  finish?: CursorSpec;
}

const pathFromRange = function (spec: RangeSpec) {
  const finish = spec.finish !== undefined ? spec.finish : spec.start;
  return path({
    startPath: spec.start.element,
    soffset: spec.start.offset,
    finishPath: finish.element,
    foffset: finish.offset
  });
};

const isCursorSpec = function (spec: CursorSpec | RangeSpec): spec is CursorSpec {
  return !('start' in spec) && 'element' in spec;
};

const pathFrom = function (spec: CursorSpec | RangeSpec) {
  return isCursorSpec(spec) ? pathFromCollapsed(spec) : pathFromRange(spec);
};

const follow = function (container: Element, calcPath: number[]): Result<Element, string> {
  return Hierarchy.follow(container, calcPath).fold(function () {
    return Result.error('Could not follow path: ' + calcPath.join(','));
  }, function (p) {
    return Result.value(p);
  });
};

const followPath = function (container: Element, calcPath: CursorPath) {
  return follow(container, calcPath.startPath()).bind(function (start) {
    return follow(container, calcPath.finishPath()).map(function (finish) {
      return range({
        start,
        soffset: calcPath.soffset(),
        finish,
        foffset: calcPath.foffset()
      });
    });
  });
};

const cFollowPath = function (calcPath: CursorPath) {
  return Chain.binder(function (container: Element) {
    return followPath(container, calcPath);
  });
};

const cFollowCursor = function (elementPath: number[], offset: number) {
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

const cFollow = function (elementPath: number[]) {
  return Chain.binder(function (container: Element) {
    return follow(container, elementPath);
  });
};

const cToRange = Chain.mapper(range);
const cToPath = Chain.mapper(path);

const calculate = function (container: Element, calcPath: CursorPath) {
  return followPath(container, calcPath).getOrDie();
};

const calculateOne = function (container: Element, calcPath: number[]) {
  return follow(container, calcPath).getOrDie();
};

export {
  range,
  path,
  pathFrom,

  cFollow,
  cFollowPath,
  cFollowCursor,
  cToRange,
  cToPath,

  calculate,
  calculateOne
};
