import Boundaries from '../array/Boundaries';
import Slice from '../array/Slice';
import Split from '../array/Split';
import { Splitting } from './Main';

type BoundAtApi = <T, T2>(xs: T[], left: T2, right: T2, comparator: (a: T2, b: T) => boolean) => T[];
const boundAt: BoundAtApi = Boundaries.boundAt;

type SplitByApi = <T>(xs: T[], pred: (x: T) => boolean) => T[][];
const splitby: SplitByApi = Split.splitby;

type SplitByAdvApi = <T>(xs: T[], pred: (x: T) => Splitting<T>) => T[][];
const splitbyAdv: SplitByAdvApi = Split.splitbyAdv;

type SliceByApi = <T>(list: T[], pred: (x: T, i: number, xs: T[]) => boolean) => T[];
const sliceby: SliceByApi = Slice.sliceby;

export default {
  splitby,
  splitbyAdv,
  sliceby,
  boundAt
};