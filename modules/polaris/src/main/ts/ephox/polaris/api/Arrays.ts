import * as Boundaries from '../array/Boundaries';
import * as Slice from '../array/Slice';
import * as Split from '../array/Split';

import type { Splitting } from './Splitting';

type SplitByApi = <T>(xs: T[], pred: (x: T) => boolean) => T[][];

type SplitByAdvApi = <T>(xs: T[], pred: (x: T) => Splitting<T>) => T[][];

type SliceByApi = <T>(list: T[], pred: (x: T, i: number) => boolean) => T[];

type BoundAtApi = <T, T2>(xs: T[], left: T2, right: T2, comparator: (a: T2, b: T) => boolean) => T[];
const boundAt: BoundAtApi = Boundaries.boundAt;

const splitby: SplitByApi = Split.splitby;

const splitbyAdv: SplitByAdvApi = Split.splitbyAdv;

const sliceby: SliceByApi = Slice.sliceby;

export {
  splitby,
  splitbyAdv,
  sliceby,
  boundAt
};