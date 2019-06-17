import { DomUniverse } from '@ephox/boss';
import { Element } from '@ephox/sugar';
import { Wrapter } from '../data/Types';
import * as Wrapping from '../general/Wrapping';

const universe = DomUniverse();

const nu = function (element: Element) {
  return Wrapping.nu(universe, element);
};

const wrapWith = function (base: Element, baseOffset: number, end: Element, endOffset: number, c: () => Wrapter<Element>) {
  return Wrapping.wrapWith(universe, base, baseOffset, end, endOffset, c);
};

const wrapper = function (wrapped: Element[], c: () => Wrapter<Element>) {
  return Wrapping.wrapper(universe, wrapped, c);
};

const leaves = function (base: Element, baseOffset: number, end: Element, endOffset: number, c: () => Wrapter<Element>) {
  return Wrapping.leaves(universe, base, baseOffset, end, endOffset, c);
};

const reuse = function (base: Element, baseOffset: number, end: Element, endOffset: number, predicate: (e: Element) => boolean, nu: () => Wrapter<Element>) {
  return Wrapping.reuse(universe, base, baseOffset, end, endOffset, predicate, nu);
};

const spans = function (base: Element, baseOffset: number, end: Element, endOffset: number, exclusions?: (e: Element) => boolean) {
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