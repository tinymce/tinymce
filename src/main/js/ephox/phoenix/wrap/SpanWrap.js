define(
  'ephox.phoenix.wrap.SpanWrap',

  [
    'ephox.bud.Unicode',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.phoenix.api.general.Injection',
    'ephox.phoenix.wrap.Wrapper',
    'ephox.phoenix.wrap.Wraps',
    'ephox.scullion.Struct'
  ],

  function (Unicode, Fun, Option, Spot, Injection, Wrapper, Wraps, Struct) {
    var point = function (universe, start, soffset, finish, foffset, exclusions) {
      var scanned = scan(universe, start, soffset, finish, foffset, exclusions);
      var cursor = scanned.cursor();
      var range = Spot.points(
        Spot.point(cursor.element(), cursor.offset()),
        Spot.point(cursor.element(), cursor.offset())
      );

      return Option.some({
        range: Fun.constant(range),
        temporary: scanned.temporary,
        wrappers: scanned.wrappers
      });
    };

    var spanCursor = Struct.immutable('span', 'cursor');

    var temporary = function (universe, start, soffset, finish, foffset) {
      var doc = start.dom().ownerDocument;
      var span = universe.create().nu('span', doc);
      
      var cursor = universe.create().text(Unicode.zeroWidth(), doc);
      universe.insert().append(span, cursor);

      Injection.atStartOf(universe, start, soffset, span);
      return {
        cursor: Fun.constant(Spot.point(cursor, 1)),
        wrappers: Fun.constant([ span ]),
        temporary: Fun.constant(true)
      };
    };

    /* 
     * The point approach needs to reuse a temporary span (if we already have one) or create one if we don't.
     */
    var scan = function (universe, start, soffset, finish, foffset, exclusions) {
      return universe.property().parent(start).bind(function (parent) {
        var cursor = Spot.point(start, soffset);
        var canReuse = isSpan(universe, exclusions, parent) && universe.property().children(parent).length === 1 && isUnicode(universe, start);
        return canReuse ? Option.some({
          cursor: Fun.constant(cursor),
          temporary: Fun.constant(false),
          wrappers: Fun.constant(parent)
        }) : Option.none();
      }).getOrThunk(function () {
        return temporary(universe, start, soffset, finish, foffset);
      });
    };

    var isUnicode = function (universe, element) {
      return universe.property().isText(element) && universe.property().getText(element) === Unicode.zeroWidth();
    };

    var isSpan = function (universe, exclusions, elem) {
      return universe.property().name(elem) === 'span' && exclusions(elem) === false;
    };

    var wrap = function (universe, start, soffset, finish, foffset, exclusions) {
      var doc = start.dom().ownerDocument;
      var nuSpan = function () {
        return Wraps(universe, universe.create().nu('span', doc));
      };

      var wrappers = Wrapper.reuse(universe, start, soffset, finish, foffset, Fun.curry(isSpan, universe, exclusions), nuSpan);
      return Option.from(wrappers[wrappers.length - 1]).map(function (lastSpan) {
        var lastOffset = universe.property().children(lastSpan).length;
        var range = Spot.points(
          Spot.point(wrappers[0], 0),
          Spot.point(lastSpan, lastOffset)
        );

        return {
          wrappers: Fun.constant(wrappers),
          temporary: Fun.constant(false),
          range: Fun.constant(range)
        };
      });
    };

    var isCollapsed = function (universe, start, soffset, finish, foffset) {
      return universe.eq(start, finish) && soffset === foffset;
    };

    var spans = function (universe, start, soffset, finish, foffset, _exclusions) {
      var exclusions = _exclusions !== undefined ? _exclusions : Fun.constant(false);
      var wrapper = isCollapsed(universe, start, soffset, finish, foffset) ? point : wrap;
      return wrapper(universe, start, soffset, finish, foffset, exclusions);
    };

    return {
      spans: spans
    };
  }
);