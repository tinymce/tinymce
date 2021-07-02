import { Universe } from '@ephox/boss';
import { Fun, Optional, Unicode } from '@ephox/katamari';

import * as Spot from '../api/data/Spot';
import { SpanWrapRange, SpotPoint } from '../api/data/Types';
import * as Injection from '../api/general/Injection';
import * as Wrapper from './Wrapper';
import { Wraps } from './Wraps';

interface SpanWrapPoint<E> {
  readonly cursor: SpotPoint<E>;
  readonly temporary: boolean;
  readonly wrappers: E[];
}

const point = <E, D>(universe: Universe<E, D>, start: E, soffset: number, _finish: E, _foffset: number, exclusions: (e: E) => boolean): Optional<SpanWrapRange<E>> => {
  const scanned = scan(universe, start, soffset, exclusions);
  const cursor = scanned.cursor;
  const range = Spot.points(
    Spot.point(cursor.element, cursor.offset),
    Spot.point(cursor.element, cursor.offset)
  );

  return Optional.some<SpanWrapRange<E>>({
    range,
    temporary: scanned.temporary,
    wrappers: scanned.wrappers
  });
};

const temporary = <E, D>(universe: Universe<E, D>, start: E, soffset: number): SpanWrapPoint<E> => {
  const doc: D = universe.property().document(start);
  const span = universe.create().nu('span', doc);

  const cursor = universe.create().text(Unicode.zeroWidth, doc);
  universe.insert().append(span, cursor);

  const injectAt = universe.property().isEmptyTag(start) ? universe.property().parent(start) : Optional.some(start);
  injectAt.each((z) => {
    Injection.atStartOf(universe, z, soffset, span);
  });

  return {
    cursor: Spot.point(cursor, 1),
    wrappers: [ span ],
    temporary: true
  };
};

/*
 * The point approach needs to reuse a temporary span (if we already have one) or create one if we don't.
 */
const scan = <E, D>(universe: Universe<E, D>, start: E, soffset: number, exclusions: (e: E) => boolean): SpanWrapPoint<E> => {
  return universe.property().parent(start).bind((parent): Optional<SpanWrapPoint<E>> => {
    const cursor = Spot.point(start, soffset);
    const canReuse = isSpan(universe, exclusions)(parent) && universe.property().children(parent).length === 1 && isUnicode(universe, start);
    return canReuse ? Optional.some<SpanWrapPoint<E>>({
      cursor,
      temporary: false,
      wrappers: [ parent ]
    }) : Optional.none();
  }).getOrThunk(() => {
    return temporary(universe, start, soffset);
  });
};

const isUnicode = <E, D>(universe: Universe<E, D>, element: E): boolean => {
  return universe.property().isText(element) && universe.property().getText(element) === Unicode.zeroWidth;
};

const isSpan = <E, D>(universe: Universe<E, D>, exclusions: (e: E) => boolean) => (elem: E): boolean =>
  universe.property().name(elem) === 'span' && exclusions(elem) === false;

const wrap = <E, D>(universe: Universe<E, D>, start: E, soffset: number, finish: E, foffset: number, exclusions: (e: E) => boolean): Optional<SpanWrapRange<E>> => {
  const doc = universe.property().document(start);
  const nuSpan = () => {
    return Wraps(universe, universe.create().nu('span', doc));
  };

  const wrappers = Wrapper.reuse(universe, start, soffset, finish, foffset, isSpan(universe, exclusions), nuSpan);
  return Optional.from(wrappers[wrappers.length - 1]).map((lastSpan): SpanWrapRange<E> => {
    const lastOffset = universe.property().children(lastSpan).length;
    const range = Spot.points(
      Spot.point(wrappers[0], 0),
      Spot.point(lastSpan, lastOffset)
    );

    return {
      wrappers,
      temporary: false,
      range
    };
  });
};

const isCollapsed = <E, D>(universe: Universe<E, D>, start: E, soffset: number, finish: E, foffset: number): boolean => {
  return universe.eq(start, finish) && soffset === foffset;
};

const spans = <E, D>(universe: Universe<E, D>, start: E, soffset: number, finish: E, foffset: number, exclusions: (e: E) => boolean = Fun.never): Optional<SpanWrapRange<E>> => {
  const wrapper = isCollapsed(universe, start, soffset, finish, foffset) ? point : wrap;
  return wrapper(universe, start, soffset, finish, foffset, exclusions);
};

export {
  spans
};
