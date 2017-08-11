asynctest(
  'atomic.tinymce.core.keyboard.MatchKeysTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Merger',
    'tinymce.core.keyboard.MatchKeys'
  ],
  function (Assertions, Logger, Pipeline, Step, Arr, Cell, Merger, MatchKeys) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var state = Cell([]);

    var event = function (evt) {
      return Merger.merge({
        shiftKey: false,
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        keyCode: 0
      }, evt);
    };

    var handleAction = function (value) {
      return function () {
        state.set(state.get().concat([value]));
        return true;
      };
    };

    var sTestMatch = function (patterns, event, expectedData) {
      return Step.sync(function () {
        state.set([]);

        var matches = MatchKeys.match(patterns, event);
        Assertions.assertEq('Should have some matches', true, matches.length > 0);

        Arr.find(matches, function (pattern) {
          return pattern.action();
        });

        Assertions.assertEq('Should have the expected state', expectedData, state.get());
      });
    };

    var sTestMatchNone = function (patterns, event) {
      return Step.sync(function () {
        Assertions.assertEq(
          'Should not produce any matches',
          0,
          MatchKeys.match(patterns, event).length
        );
      });
    };

    var sTestExecute = function (patterns, event, expectedData, expectedMatch) {
      return Step.sync(function () {
        state.set([]);

        var result = MatchKeys.execute(patterns, event);
        Assertions.assertEq('Should be expected match', expectedMatch, result.getOr());
        Assertions.assertEq('Should have the expected state', expectedData, state.get());
      });
    };

    var actionA = handleAction('a');
    var actionB = handleAction('b');

    Pipeline.async({}, [
      sTestMatchNone([], {}),
      sTestMatchNone([], event({ keyCode: 65 })),
      sTestMatchNone([{ keyCode: 65, action: actionA }], event({ keyCode: 13 })),
      sTestMatch([{ keyCode: 65, action: actionA }], event({ keyCode: 65 }), ['a']),
      sTestMatch([{ keyCode: 65, shiftKey: true, action: actionA }], event({ keyCode: 65, shiftKey: true }), ['a']),
      sTestMatch([{ keyCode: 65, altKey: true, action: actionA }], event({ keyCode: 65, altKey: true }), ['a']),
      sTestMatch([{ keyCode: 65, ctrlKey: true, action: actionA }], event({ keyCode: 65, ctrlKey: true }), ['a']),
      sTestMatch([{ keyCode: 65, metaKey: true, action: actionA }], event({ keyCode: 65, metaKey: true }), ['a']),
      sTestMatch(
        [
          { keyCode: 65, ctrlKey: true, metaKey: true, altKey: true, action: actionA },
          { keyCode: 65, ctrlKey: true, metaKey: true, action: actionB }
        ],
        event({ keyCode: 65, metaKey: true, ctrlKey: true }),
        ['b']
      ),
      sTestExecute(
        [
          { keyCode: 65, ctrlKey: true, metaKey: true, altKey: true, action: actionA },
          { keyCode: 65, ctrlKey: true, metaKey: true, action: actionB }
        ],
        event({ keyCode: 65, metaKey: true, ctrlKey: true }),
        ['b'],
        { "shiftKey": false, "altKey": false, "ctrlKey": true, "metaKey": true, keyCode: 65, action: actionB }
      ),
      Logger.t('Action wrapper helper', Step.sync(function () {
        var action = MatchKeys.action(function () {
          return Array.prototype.slice.call(arguments, 0);
        }, 1, 2, 3);

        Assertions.assertEq('Should return the parameters passed in', [1, 2, 3], action());
      }))
    ], function () {
      success();
    }, failure);
  }
);
