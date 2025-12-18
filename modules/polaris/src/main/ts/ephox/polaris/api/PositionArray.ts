import type { Arr, Optional } from '@ephox/katamari';

import * as Generator from '../parray/Generator';
import * as Query from '../parray/Query';
import * as Split from '../parray/Split';
import * as Translate from '../parray/Translate';
import type { PRange } from '../pattern/Types';

type GetApi = <T extends PRange>(parray: T[], offset: number) => Optional<T>;

type FindApi = typeof Arr.find;

type SplitsApi = <T extends PRange>(parray: T[], positions: number[], subdivide: (unit: T, positions: number[]) => T[]) => T[];

type TranslateApi = <T extends PRange>(parray: T[], offset: number) => T[];

type SublistApi = <T extends PRange>(parray: T[], start: number, finish: number) => T[];

type GenerateApi = <T, R extends { finish: number }>(xs: T[], f: (x: T, offset: number) => Optional<R>, start?: number) => R[];
const generate: GenerateApi = Generator.make;

const get: GetApi = Query.get;

const find: FindApi = Query.find;

const splits: SplitsApi = Split.splits;

const translate: TranslateApi = Translate.translate;

const sublist: SublistApi = Query.sublist;

export {
  generate,
  get,
  find,
  splits,
  translate,
  sublist
};