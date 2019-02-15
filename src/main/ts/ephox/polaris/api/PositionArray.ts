import Generator from '../parray/Generator';
import Query from '../parray/Query';
import Split from '../parray/Split';
import Translate from '../parray/Translate';
import { Option, Arr } from '@ephox/katamari';
import { PRange } from '../pattern/Types';

type GenerateApi = <T, R extends { finish: () => number; }>(xs: T[], f: (x: T, offset: number) => Option<R>, start?: number) => R[];
const generate: GenerateApi = Generator.make;

type GetApi = <T extends PRange>(parray: T[], offset: number) => Option<T>;
const get: GetApi = Query.get;

type FindApi = typeof Arr.find;
const find: FindApi = Query.find;

type SplitsApi = <T extends PRange>(parray: T[], positions: number[], subdivide: (unit: T, positions: number[]) => T[]) => T[];
const splits: SplitsApi = Split.splits;

type TranslateApi = <T extends PRange>(parray: T[], offset: number) => T[];
const translate: TranslateApi = Translate.translate;

type SublistApi = <T extends PRange>(parray: T[], start: number, finish: number) => T[];
const sublist: SublistApi = Query.sublist;

export default {
  generate,
  get,
  find,
  splits,
  translate,
  sublist
};