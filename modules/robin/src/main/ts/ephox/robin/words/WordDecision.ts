import { Universe } from '@ephox/boss';
import { Option, Struct } from '@ephox/katamari';

export interface WordDecisionItem<E> {
  item: () => E;
  start: () => number;
  finish: () => number;
  text: () => string;
}

export interface WordDecision<E> {
  items: () => WordDecisionItem<E>[];
  abort: () => boolean;
}

const make: <E> (item: E, start: number, finish: number, text: string) => WordDecisionItem<E> = Struct.immutable('item', 'start', 'finish', 'text');
const decision: <E> (items: WordDecisionItem<E>[], abort: boolean) => WordDecision<E> = Struct.immutable('items', 'abort');

const detail = function <E, D> (universe: Universe<E, D>, item: E) {
  const text = universe.property().getText(item);
  return make(item, 0, text.length, text);
};

const fromItem = function <E, D> (universe: Universe<E, D>, item: E) {
  return universe.property().isText(item) ? detail(universe, item) : make(item, 0, 0, '');
};

const onEdge = function <E, D> (universe: Universe<E, D>, item: E, slicer: (text: string) => Option<[number, number]>) {
  return decision([] as WordDecisionItem<E>[], true);
};

const onOther = function <E, D> (universe: Universe<E, D>, item: E, slicer: (text: string) => Option<[number, number]>) {
  return decision([] as WordDecisionItem<E>[], false);
};

// Returns: a 'decision' Struct with the items slot containing an empty array if None
//   or  a zero-width [start, end] range was returned by slicer, or 1-element array of the
//   [start, end] substring otherwise.
const onText = function <E, D> (universe: Universe<E, D>, item: E, slicer: (text: string) => Option<[number, number]>) {
  const text = universe.property().getText(item);
  return slicer(text).fold(function () {
    return decision([ make(item, 0, text.length, text) ], false);
  }, function (splits) {
    const items = splits[0] === splits[1] ? [] : [ make(item, splits[0], splits[1], text.substring(splits[0], splits[1])) ];
    return decision(items, true);
  });
};

// Return decision struct with one or zero 'make' Struct items. If present the make struct item is the entire item node text,
// or a substring of it with the [left, right] bounds as determined by the result of slicer(item).
const decide = function <E, D> (universe: Universe<E, D>, item: E, slicer: (text: string) => Option<[number, number]>, isCustomBoundary: (universe: Universe<E, D>, item: E) => boolean) {
  const f = (function () {
    if (universe.property().isBoundary(item)) {
      return onEdge;
    } else if (universe.property().isEmptyTag(item)) {
      return onEdge;
    } else if (isCustomBoundary(universe, item)) {
      return onEdge;
    } else if (universe.property().isText(item)) {
      return onText;
    } else {
      return onOther;
    }
  })();
  return f(universe, item, slicer);
};

export const WordDecision = {
  detail,
  fromItem,
  decide
};