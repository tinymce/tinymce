/*
test(
  'OriginRepositionTest',

  {
    'ephox.alloy.positioning.view.OriginsUI': '../../mock/OriginsUI'
  },

  [
    'ephox.alloy.positioning.layout.Direction',
    'ephox.alloy.positioning.layout.Origins',
    'ephox.alloy.positioning.view.Reposition',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Type'
  ],

  (Direction, Origins, Reposition, Fun, Option, Type) => {
    // Disabled until we remove need for mocking.

    var noneOrigin = Origins.none();
    var relativeOrigin = Origins.relative(5, 10);
    var fixedOrigin = Origins.fixed(5, 10, 500, 500);

    var assertOption = (expected, actual) => {
      expected.fold(() => {
        actual.fold(() => {
          // pass
        }, (av) => {
          assert.fail('Expected was none, actual was ' + av);
        });
      }, (ev) => {
        actual.fold(() => {
          assert.fail('Expected "' + ev + '" but was none');
        }, (av) => {
          assert.eq(ev, av);
        });
      });
    };

    var makeDecision = (x, y, width, height, direction) => {
      // Runtime type check because I made this mistake a few times while writing the test
      assert.eq(true, Type.isFunction(direction.fold), 'direction passed into makeDecision was not an ADT');

      return Reposition.decision({
        x: x,
        y: y,
        width: width,
        height: height,
        maxHeight: -1,
        direction: direction,
        classes: [],
        label: 'test decision',
        candidateYforTest: -1
      });
    };

    var check = (expected, origin, decision) => {
      var actual = Origins.reposition(origin, decision);

      assert.eq(expected.position(), actual.position());

      // Not using an array so the error stack traces are useful
      assertOption(expected.left(), actual.left());
      assertOption(expected.top(), actual.top());
      assertOption(expected.right(), actual.right());
      assertOption(expected.bottom(), actual.bottom());
    };

    var makeOnscreen = Fun.curry(makeDecision, 100, 101, 102, 103);

    // none ignores direction
    var noneResult = Reposition.css('absolute', Option.some(100), Option.some(101), Option.none(), Option.none());
    check(noneResult, noneOrigin, makeOnscreen(Direction.southeast()));
    check(noneResult, noneOrigin, makeOnscreen(Direction.southwest()));
    check(noneResult, noneOrigin, makeOnscreen(Direction.northeast()));
    check(noneResult, noneOrigin, makeOnscreen(Direction.northwest()));

    // relative ignores direction
    var relativeResult = Reposition.css('absolute', Option.some(100 - 5), Option.some(101 - 10), Option.none(), Option.none());
    check(relativeResult, relativeOrigin, makeOnscreen(Direction.southeast()));
    check(relativeResult, relativeOrigin, makeOnscreen(Direction.southwest()));
    check(relativeResult, relativeOrigin, makeOnscreen(Direction.northeast()));
    check(relativeResult, relativeOrigin, makeOnscreen(Direction.northwest()));

    var fixedLeft = Option.some(95);    // 100 - 5
    var fixedTop = Option.some(91);     // 101 - 10
    var fixedRight = Option.some(303);  // 500 - 95 - 102
    var fixedBottom = Option.some(306); // 500 - 91 - 103
    var none = Option.none();

    check(Reposition.css('fixed', fixedLeft, fixedTop, none, none), fixedOrigin, makeOnscreen(Direction.southeast()));
    check(Reposition.css('fixed', none, fixedTop, fixedRight, none), fixedOrigin, makeOnscreen(Direction.southwest()));
    check(Reposition.css('fixed', fixedLeft, none, none, fixedBottom), fixedOrigin, makeOnscreen(Direction.northeast()));
    check(Reposition.css('fixed', none, none, fixedRight, fixedBottom), fixedOrigin, makeOnscreen(Direction.northwest()));

    // -5 is zero minus origin x
    // -10 is zero minus origin y
    var expectedBeyondTopLeft = Reposition.css('fixed', Option.some(-5), Option.some(-10), none, none);
    check(expectedBeyondTopLeft, fixedOrigin, makeDecision(0, 0, 102, 103, Direction.southeast()));

    // -10 is zero minus origin y
    // -197 is distance from the right of origin to right of popup: 500 - (600 - 5) - 102
    var expectedBeyondTopRight = Reposition.css('fixed', none, Option.some(-10), Option.some(-197), none);
    check(expectedBeyondTopRight, fixedOrigin, makeDecision(600, 0, 102, 103, Direction.southwest()));

    // -5 is zero minus origin x
    // -193 is distance from bottom of origin to bottom of popup: 500 - (600 - 10) - 103
    var expectedBeyondBottomLeft = Reposition.css('fixed', Option.some(-5), none, none, Option.some(-193));
    check(expectedBeyondBottomLeft, fixedOrigin, makeDecision(0, 600, 102, 103, Direction.northeast()));

    // -197 is distance from the right of origin to right of popup: 500 - (600 - 5) - 102
    // -193 is distance from bottom of origin to bottom of popup: 500 - (600 - 10) - 103
    var expectedBeyondBottomRight = Reposition.css('fixed', none, none, Option.some(-197), Option.some(-193));
    check(expectedBeyondBottomRight, fixedOrigin, makeDecision(600, 600, 102, 103, Direction.northwest()));
  }
);
*/