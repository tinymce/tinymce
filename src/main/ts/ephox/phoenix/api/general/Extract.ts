import { Universe } from '@ephox/boss';
import { Option } from '@ephox/katamari';
import * as Extract from '../../extract/Extract';
import * as ExtractText from '../../extract/ExtractText';
import * as Find from '../../extract/Find';
import { TypedItem } from '../data/TypedItem';
import { SpotPoint } from '../data/Types';

type FromApi = <E, D>(universe: Universe<E, D>, item: E, optimise?: (e: E) => boolean) => TypedItem<E, D>[];
const from: FromApi = Extract.typed;

type AllApi = <E, D>(universe: Universe<E, D>, item: E, optimise?: (e: E) => boolean) => E[];
const all: AllApi = Extract.items;

type ExtractApi = <E, D>(universe: Universe<E, D>, child: E, offset: number, optimise?: (e: E) => boolean) => SpotPoint<E>;
const extract: ExtractApi = Extract.extract;

type ExtractToApi = <E, D>(universe: Universe<E, D>, child: E, offset: number, pred: (e: E) => boolean, optimise?: (e: E) => boolean) => SpotPoint<E>;
const extractTo: ExtractToApi = Extract.extractTo;

type FindApi = <E, D>(universe: Universe<E, D>, parent: E, offset: number, optimise?: (e: E) => boolean) => Option<SpotPoint<E>>;
const find: FindApi = Find.find;

type ToTextApi = <E, D>(universe: Universe<E, D>, item: E, optimise?: (e: E) => boolean) => string;
const toText: ToTextApi = ExtractText.from;

export {
  extract,
  extractTo,
  all,
  from,
  find,
  toText,
};