import { Result, Struct } from '@ephox/katamari';
import { Element, Hierarchy } from '@ephox/sugar';

import { Chain } from './Chain';

export interface CursorRange {
  start: () => Element<any>;
  soffset: () => number;
  finish: () => Element<any>;
  foffset: () => number;
}

export interface CursorPath {
  startPath: () => number[];
  soffset: () => number;
  finishPath: () => number[];
  foffset: () => number;
}

type RangeConstructor = (obj: { start: Element<any>; soffset: number; finish: Element<any>; foffset: number; }) => CursorRange;

const range: RangeConstructor = Struct.immutableBag(['start', 'soffset', 'finish', 'foffset'], []);

type PathConstructor = (obj: { startPath: number[]; soffset: number; finishPath: number[]; foffset: number; }) => CursorPath;

const path: PathConstructor = Struct.immutableBag(['startPath', 'soffset', 'finishPath', 'foffset'], []);

export interface CursorSpec {
  element: number[];
  offset: number;
}

const pathFromCollapsed = (spec: CursorSpec): CursorPath =>
  path({
    startPath: spec.element,
    soffset: spec.offset,
    finishPath: spec.element,
    foffset: spec.offset
  });

export interface RangeSpec {
  start: CursorSpec;
  finish?: CursorSpec;
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
