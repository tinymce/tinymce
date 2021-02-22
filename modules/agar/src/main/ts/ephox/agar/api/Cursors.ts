import { Result } from '@ephox/katamari';
import { Hierarchy, SugarElement } from '@ephox/sugar';

import { Chain } from './Chain';

export interface CursorRange {
  readonly start: SugarElement<any>;
  readonly soffset: number;
  readonly finish: SugarElement<any>;
  readonly foffset: number;
}

export interface CursorPath {
  readonly startPath: number[];
  readonly soffset: number;
  readonly finishPath: number[];
  readonly foffset: number;
}

const range = (obj: { start: SugarElement<any>; soffset: number; finish: SugarElement<any>; foffset: number }): CursorRange => ({
  start: obj.start,
  soffset: obj.soffset,
  finish: obj.finish,
  foffset: obj.foffset
});

const path = (obj: { startPath: number[]; soffset: number; finishPath: number[]; foffset: number }): CursorPath => ({
  startPath: obj.startPath,
  soffset: obj.soffset,
  finishPath: obj.finishPath,
  foffset: obj.foffset
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

const follow = (container: SugarElement<any>, calcPath: number[]): Result<SugarElement<any>, string> =>
  Hierarchy.follow(container, calcPath).fold(() =>
    Result.error('Could not follow path: ' + calcPath.join(',')),
  Result.value
  );

const followPath = (container: SugarElement<any>, calcPath: CursorPath): Result<CursorRange, string> =>
  follow(container, calcPath.startPath).bind((start) =>
    follow(container, calcPath.finishPath).map((finish) =>
      range({
        start,
        soffset: calcPath.soffset,
        finish,
        foffset: calcPath.foffset
      })));

const cFollowPath = (calcPath: CursorPath): Chain<SugarElement<any>, CursorRange> =>
  Chain.binder((container: SugarElement<any>) => followPath(container, calcPath));

const cFollowCursor = (elementPath: number[], offset: number): Chain<SugarElement<any>, CursorRange> =>
  Chain.binder((container: SugarElement<any>) =>
    follow(container, elementPath).map((element) =>
      range({
        start: element,
        soffset: offset,
        finish: element,
        foffset: offset
      })
    )
  );

const cFollow = (elementPath: number[]): Chain<SugarElement<any>, SugarElement<any>> =>
  Chain.binder((container: SugarElement<any>) => follow(container, elementPath));

const cToRange = Chain.mapper(range);
const cToPath = Chain.mapper(path);

const calculate = (container: SugarElement<any>, calcPath: CursorPath): CursorRange =>
  followPath(container, calcPath).getOrDie();

const calculateOne = (container: SugarElement<any>, calcPath: number[]): SugarElement<any> =>
  follow(container, calcPath).getOrDie();

export {
  range,
  path,
  pathFrom,
  follow,
  followPath,

  cFollow,
  cFollowPath,
  cFollowCursor,
  cToRange,
  cToPath,

  calculate,
  calculateOne
};
