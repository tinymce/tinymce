import { DomUniverse } from '@ephox/boss';
import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { SpanWrapRange, SpotPoints, Wrapter } from '../data/Types';
import * as Wrapping from '../general/Wrapping';

const universe = DomUniverse();

const nu = function (element: SugarElement): Wrapter<SugarElement> {
  return Wrapping.nu(universe, element);
};

const wrapWith = function (base: SugarElement, baseOffset: number, end: SugarElement, endOffset: number, c: () => Wrapter<SugarElement>): SugarElement[] {
  return Wrapping.wrapWith(universe, base, baseOffset, end, endOffset, c);
};

const wrapper = function (wrapped: SugarElement[], c: () => Wrapter<SugarElement>): SugarElement[] {
  return Wrapping.wrapper(universe, wrapped, c);
};

const leaves = function (base: SugarElement, baseOffset: number, end: SugarElement, endOffset: number, c: () => Wrapter<SugarElement>): Optional<SpotPoints<SugarElement>> {
  return Wrapping.leaves(universe, base, baseOffset, end, endOffset, c);
};

const reuse = function (base: SugarElement, baseOffset: number, end: SugarElement, endOffset: number, predicate: (e: SugarElement) => boolean, nu: () => Wrapter<SugarElement>): SugarElement[] {
  return Wrapping.reuse(universe, base, baseOffset, end, endOffset, predicate, nu);
};

const spans = function (base: SugarElement, baseOffset: number, end: SugarElement, endOffset: number, exclusions?: (e: SugarElement) => boolean): Optional<SpanWrapRange<SugarElement>> {
  return Wrapping.spans(universe, base, baseOffset, end, endOffset, exclusions);
};

export {
  nu,
  wrapWith,
  wrapper,
  leaves,
  reuse,
  spans
};
