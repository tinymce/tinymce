import type { Universe } from '@ephox/boss';
import type { Optional } from '@ephox/katamari';

import * as SpanWrap from '../../wrap/SpanWrap';
import * as Wrapper from '../../wrap/Wrapper';
import { Wraps } from '../../wrap/Wraps';
import type { SpanWrapRange, SpotPoints, Wrapter } from '../data/Types';

type WrapWithApi = <E, D>(universe: Universe<E, D>, base: E, baseOffset: number, end: E, endOffset: number, nu: () => Wrapter<E>) => E[];

type WrapperApi = <E, D>(universe: Universe<E, D>, wrapped: E[], nu: () => Wrapter<E>) => E[];

type LeavesApi = <E, D>(universe: Universe<E, D>, base: E, baseOffset: number, end: E, endOffset: number, nu: () => Wrapter<E>) => Optional<SpotPoints<E>>;

type ReuseApi = <E, D>(universe: Universe<E, D>, base: E, baseOffset: number, end: E, endOffset: number, predicate: (e: E) => boolean, nu: () => Wrapter<E>) => E[];

type NuApi = <E, D>(universe: Universe<E, D>, item: E) => Wrapter<E>;
const nu: NuApi = Wraps;

const wrapWith: WrapWithApi = Wrapper.wrapWith;

const wrapper: WrapperApi = Wrapper.wrapper;

const leaves: LeavesApi = Wrapper.leaves;

const reuse: ReuseApi = Wrapper.reuse;

const spans = <E, D>(universe: Universe<E, D>, base: E, baseOffset: number, end: E, endOffset: number, exclusions?: (e: E) => boolean): Optional<SpanWrapRange<E>> => {
  return SpanWrap.spans(universe, base, baseOffset, end, endOffset, exclusions);
};

export {
  nu,
  wrapWith,
  wrapper,
  leaves,
  reuse,
  spans
};