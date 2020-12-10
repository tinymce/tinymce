import { Universe } from '@ephox/boss';
import { Optional } from '@ephox/katamari';

export interface WordDecisionItem<E> {
  readonly item: E;
  readonly start: number;
  readonly finish: number;
  readonly text: string;
}

export interface WordDecision<E> {
  readonly items: WordDecisionItem<E>[];
  readonly abort: boolean;
}

const make = <E>(item: E, start: number, finish: number, text: string): WordDecisionItem<E> => ({
  item, start, finish, text
});

const decision = <E>(items: WordDecisionItem<E>[], abort: boolean): WordDecision<E> => ({
  items, abort
});

const detail = <E, D>(universe: Universe<E, D>, item: E): WordDecisionItem<E> => {
  const text = universe.property().getText(item);
  return make(item, 0, text.length, text);
};

const fromItem = <E, D>(universe: Universe<E, D>, item: E): WordDecisionItem<E> => {
  return universe.property().isText(item) ? detail(universe, item) : make(item, 0, 0, '');
};

const onEdge = <E, D>(_universe: Universe<E, D>, _item: E, _slicer: (text: string) => Optional<[number, number]>): WordDecision<E> => {
  return decision<E>([], true);
};

const onOther = <E, D>(_universe: Universe<E, D>, _item: E, _slicer: (text: string) => Optional<[number, number]>): WordDecision<E> => {
  return decision<E>([], false);
};

// Returns: a 'decision' Struct with the items slot containing an empty array if None
//   or  a zero-width [start, end] range was returned by slicer, or 1-element array of the
//   [start, end] substring otherwise.
const onText = <E, D>(universe: Universe<E, D>, item: E, slicer: (text: string) => Optional<[number, number]>): WordDecision<E> => {
  const text = universe.property().getText(item);
  return slicer(text).fold(() => {
    return decision([ make(item, 0, text.length, text) ], false);
  }, (splits) => {
    const items = splits[0] === splits[1] ? [] : [ make(item, splits[0], splits[1], text.substring(splits[0], splits[1])) ];
    return decision(items, true);
  });
};

// Return decision struct with one or zero 'make' Struct items. If present the make struct item is the entire item node text,
// or a substring of it with the [left, right] bounds as determined by the result of slicer(item).
const decide = <E, D>(universe: Universe<E, D>, item: E, slicer: (text: string) => Optional<[number, number]>, isCustomBoundary: (universe: Universe<E, D>, item: E) => boolean): WordDecision<E> => {
  const f = (() => {
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
