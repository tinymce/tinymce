import type { Universe } from '@ephox/boss';
import type { Optional } from '@ephox/katamari';

import * as Extract from '../../extract/Extract';
import * as ExtractText from '../../extract/ExtractText';
import * as Find from '../../extract/Find';
import type { TypedItem } from '../data/TypedItem';
import type { SpotPoint } from '../data/Types';

type AllApi = <E, D>(universe: Universe<E, D>, item: E, optimise?: (e: E) => boolean) => E[];

type ExtractApi = <E, D>(universe: Universe<E, D>, child: E, offset: number, optimise?: (e: E) => boolean) => SpotPoint<E>;

type ExtractToApi = <E, D>(universe: Universe<E, D>, child: E, offset: number, pred: (e: E) => boolean, optimise?: (e: E) => boolean) => SpotPoint<E>;

type FindApi = <E, D>(universe: Universe<E, D>, parent: E, offset: number, optimise?: (e: E) => boolean) => Optional<SpotPoint<E>>;

type ToTextApi = <E, D>(universe: Universe<E, D>, item: E, optimise?: (e: E) => boolean) => string;

type FromApi = <E, D>(universe: Universe<E, D>, item: E, optimise?: (e: E) => boolean) => TypedItem<E, D>[];
const from: FromApi = Extract.typed;

const all: AllApi = Extract.items;

const extract: ExtractApi = Extract.extract;

const extractTo: ExtractToApi = Extract.extractTo;

const find: FindApi = Find.find;

const toText: ToTextApi = ExtractText.from;

export {
  extract,
  extractTo,
  all,
  from,
  find,
  toText
};