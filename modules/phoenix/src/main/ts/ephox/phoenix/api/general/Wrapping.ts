import { Universe } from '@ephox/boss';
import { Optional } from '@ephox/katamari';

import * as SpanWrap from '../../wrap/SpanWrap';
import * as Wrapper from '../../wrap/Wrapper';
import { Wraps } from '../../wrap/Wraps';
import { SpanWrapRange, SpotPoints, Wrapter } from '../data/Types';

type NuApi = <E, D>(universe: Universe<E, D>, item: E) => Wrapter<E>;
const nu: NuApi = Wraps;

type WrapWithApi = <E, D>(universe: Universe<E, D>, base: E, baseOffset: number, end: E, endOffset: number, nu: () => Wrapter<E>) => E[];
const wrapWith: WrapWithApi = Wrapper.wrapWith;

type WrapperApi = <E, D>(universe: Universe<E, D>, wrapped: E[], nu: () => Wrapter<E>) => E[];
const wrapper: WrapperApi = Wrapper.wrapper;

type LeavesApi = <E, D>(universe: Universe<E, D>, base: E, baseOffset: number, end: E, endOffset: number, nu: () => Wrapter<E>) => Optional<SpotPoints<E>>;
const leaves: LeavesApi = Wrapper.leaves;

type ReuseApi = <E, D>(universe: Universe<E, D>, base: E, baseOffset: number, end: E, endOffset: number, predicate: (e: E) => boolean, nu: () => Wrapter<E>) => E[];
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
