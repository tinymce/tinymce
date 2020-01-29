import { Universe } from '@ephox/boss';
import { Fun, Option, Unicode } from '@ephox/katamari';
import * as Spot from '../api/data/Spot';
import { SpanWrapRange, SpotPoint } from '../api/data/Types';
import * as Injection from '../api/general/Injection';
import * as Wrapper from './Wrapper';
import { Wraps } from './Wraps';

interface SpanWrapPoint<E> {
  cursor(): SpotPoint<E>;
  temporary(): boolean;
  wrappers(): E[];
}

const point = function <E, D>(universe: Universe<E, D>, start: E, soffset: number, _finish: E, _foffset: number, exclusions: (e: E) => boolean): Option<SpanWrapRange<E>> {
  const scanned = scan(universe, start, soffset, exclusions);
  const cursor = scanned.cursor();
  const range = Spot.points(
    Spot.point(cursor.element(), cursor.offset()),
    Spot.point(cursor.element(), cursor.offset())
  );

  return Option.some<SpanWrapRange<E>>({
    range: Fun.constant(range),
    temporary: scanned.temporary,
    wrappers: scanned.wrappers
  });
};

const temporary = function <E, D>(universe: Universe<E, D>, start: E, soffset: number): SpanWrapPoint<E> {
  const doc: D = universe.property().document(start);
  const span = universe.create().nu('span', doc);

  const cursor = universe.create().text(Unicode.zeroWidth, doc);
  universe.insert().append(span, cursor);

  const injectAt = universe.property().isEmptyTag(start) ? universe.property().parent(start) : Option.some(start);
  injectAt.each(function (z) {
    Injection.atStartOf(universe, z, soffset, span);
  });

  return {
    cursor: Fun.constant(Spot.point(cursor, 1)),
    wrappers: Fun.constant([span]),
    temporary: Fun.constant(true)
  };
};

/*
 * The point approach needs to reuse a temporary span (if we already have one) or create one if we don't.
 */
const scan = function <E, D>(universe: Universe<E, D>, start: E, soffset: number, exclusions: (e: E) => boolean): SpanWrapPoint<E> {
  return universe.property().parent(start).bind(function (parent): Option<SpanWrapPoint<E>> {
    const cursor = Spot.point(start, soffset);
    const canReuse = isSpan(universe, exclusions)(parent) && universe.property().children(parent).length === 1 && isUnicode(universe, start);
    return canReuse ? Option.some<SpanWrapPoint<E>>({
      cursor: Fun.constant(cursor),
      temporary: Fun.constant(false),
      wrappers: Fun.constant([parent])
    }) : Option.none();
  }).getOrThunk(function () {
    return temporary(universe, start, soffset);
  });
};

const isUnicode = function <E, D>(universe: Universe<E, D>, element: E) {
  return universe.property().isText(element) && universe.property().getText(element) === Unicode.zeroWidth;
};

const isSpan = <E, D>(universe: Universe<E, D>, exclusions: (e: E) => boolean) => (elem: E) => {
  return universe.property().name(elem) === 'span' && exclusions(elem) === false;
};

const wrap = function <E, D>(universe: Universe<E, D>, start: E, soffset: number, finish: E, foffset: number, exclusions: (e: E) => boolean): Option<SpanWrapRange<E>> {
  const doc = universe.property().document(start);
  const nuSpan = function () {
    return Wraps(universe, universe.create().nu('span', doc));
  };

  const wrappers = Wrapper.reuse(universe, start, soffset, finish, foffset, isSpan(universe, exclusions), nuSpan);
  return Option.from(wrappers[wrappers.length - 1]).map(function (lastSpan) {
    const lastOffset = universe.property().children(lastSpan).length;
    const range = Spot.points(
      Spot.point(wrappers[0], 0),
      Spot.point(lastSpan, lastOffset)
    );

    return {
      wrappers: Fun.constant(wrappers),
      temporary: Fun.constant<boolean>(false),
      range: Fun.constant(range)
    };
  });
};

const isCollapsed = function <E, D>(universe: Universe<E, D>, start: E, soffset: number, finish: E, foffset: number) {
  return universe.eq(start, finish) && soffset === foffset;
};

const spans = function <E, D>(universe: Universe<E, D>, start: E, soffset: number, finish: E, foffset: number, exclusions: (e: E) => boolean = Fun.never) {
  const wrapper = isCollapsed(universe, start, soffset, finish, foffset) ? point : wrap;
  return wrapper(universe, start, soffset, finish, foffset, exclusions);
};

export {
  spans
};
