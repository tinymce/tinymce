import * as Boundaries from '../array/Boundaries';
import * as Slice from '../array/Slice';
import * as Split from '../array/Split';
import { Splitting } from './Splitting';

type BoundAtApi = <T, T2>(xs: T[], left: T2, right: T2, comparator: (a: T2, b: T) => boolean) => T[];
const boundAt: BoundAtApi = Boundaries.boundAt;

type SplitByApi = <T>(xs: T[], pred: (x: T) => boolean) => T[][];
const splitby: SplitByApi = Split.splitby;

type SplitByAdvApi = <T>(xs: T[], pred: (x: T) => Splitting<T>) => T[][];
const splitbyAdv: SplitByAdvApi = Split.splitbyAdv;

type SliceByApi = <T>(list: T[], pred: (x: T, i: number) => boolean) => T[];
const sliceby: SliceByApi = Slice.sliceby;

export {
  splitby,
  splitbyAdv,
  sliceby,
  boundAt
};
