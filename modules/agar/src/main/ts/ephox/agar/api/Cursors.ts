import { Fun, Result } from '@ephox/katamari';
import { Element, Hierarchy } from '@ephox/sugar';

import { Chain } from './Chain';

export interface CursorRange {
  readonly start: () => Element<any>;
  readonly soffset: () => number;
  readonly finish: () => Element<any>;
  readonly foffset: () => number;
}

export interface CursorPath {
  startPath: () => number[];
  soffset: () => number;
  finishPath: () => number[];
  foffset: () => number;
}

const range = (obj: { start: Element<any>; soffset: number; finish: Element<any>; foffset: number }): CursorRange => ({
  start: Fun.constant(obj.start),
  soffset: Fun.constant(obj.soffset),
  finish: Fun.constant(obj.finish),
  foffset: Fun.constant(obj.foffset)
});

const path = (obj: { startPath: number[]; soffset: number; finishPath: number[]; foffset: number }): CursorPath => ({
  startPath: Fun.constant(obj.startPath),
  soffset: Fun.constant(obj.soffset),
  finishPath: Fun.constant(obj.finishPath),
  foffset: Fun.constant(obj.foffset)
});

export interface CursorSpec {
  readonly element: number[];
  readonly offset: number;
}

const pathFromCollapsed = (spec: CursorSpec): CursorPath =>
  path({
    startPath: spec.element,
    soffset: spec.offset,
    finishPath: spec.element,
    foffset: spec.offset
  });

export interface RangeSpec {
  readonly start: CursorSpec;
  readonly finish?: CursorSpec;
}

const pathFromRange = (spec: RangeSpec): CursorPath => {
  const finish = spec.finish !== undefined ? spec.finish : spec.start;
  return path({
    startPath: spec.start.element,
    soffset: spec.start.offset,
    finishPath: finish.element,
    foffset: finish.offset
  });
};

const isCursorSpec = (spec: CursorSpec | RangeSpec): spec is CursorSpec =>
  !('start' in spec) && 'element' in spec;

const pathFrom = (spec: CursorSpec | RangeSpec): CursorPath =>
  isCursorSpec(spec) ? pathFromCollapsed(spec) : pathFromRange(spec);

const follow = (container: Element<any>, calcPath: number[]): Result<Element<any>, string> =>
  Hierarchy.follow(container, calcPath).fold(() =>
    Result.error('Could not follow path: ' + calcPath.join(',')),
  Result.value
  );

const followPath = (container: Element<any>, calcPath: CursorPath): Result<CursorRange, string> =>
  follow(container, calcPath.startPath()).bind((start) =>
    follow(container, calcPath.finishPath()).map((finish) =>
      range({
        start,
        soffset: calcPath.soffset(),
        finish,
        foffset: calcPath.foffset()
      })));

const cFollowPath = (calcPath: CursorPath): Chain<Element<any>, CursorRange> =>
  Chain.binder((container: Element<any>) => followPath(container, calcPath));

const cFollowCursor = (elementPath: number[], offset: number): Chain<Element<any>, CursorRange> =>
  Chain.binder((container: Element<any>) =>
    follow(container, elementPath).map((element) =>
      range({
        start: element,
        soffset: offset,
        finish: element,
        foffset: offset
      })
    )
  );

const cFollow = (elementPath: number[]): Chain<Element<any>, Element<any>> =>
  Chain.binder((container: Element<any>) => follow(container, elementPath));

const cToRange = Chain.mapper(range);
const cToPath = Chain.mapper(path);

const calculate = (container: Element<any>, calcPath: CursorPath): CursorRange =>
  followPath(container, calcPath).getOrDie();

const calculateOne = (container: Element<any>, calcPath: number[]): Element<any> =>
  follow(container, calcPath).getOrDie();

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
