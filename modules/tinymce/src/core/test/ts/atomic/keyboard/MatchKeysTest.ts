import { Assertions, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Cell } from '@ephox/katamari';
import * as MatchKeys from 'tinymce/core/keyboard/MatchKeys';

UnitTest.asynctest('atomic.tinymce.core.keyboard.MatchKeysTest', function (success, failure) {
  const state = Cell([]);

  const event = function (evt) {
    return {
      shiftKey: false,
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      keyCode: 0,
      ...evt
    };
  };

  const handleAction = function (value) {
    return function () {
      state.set(state.get().concat([ value ]));
      return true;
    };
  };

  const sTestMatch = function (patterns, event, expectedData) {
    return Step.sync(function () {
      state.set([]);

      const matches = MatchKeys.match(patterns, event);
      Assertions.assertEq('Should have some matches', true, matches.length > 0);

      Arr.find(matches, function (pattern) {
        return pattern.action();
      });

      Assertions.assertEq('Should have the expected state', expectedData, state.get());
    });
  };

  const sTestMatchNone = function (patterns, event) {
    return Step.sync(function () {
      Assertions.assertEq(
        'Should not produce any matches',
        0,
        MatchKeys.match(patterns, event).length
      );
    });
  };

  const sTestExecute = function (patterns, event, expectedData, expectedMatch) {
    return Step.sync(function () {
      state.set([]);

      const result = MatchKeys.execute(patterns, event);
      Assertions.assertEq('Should be expected match', expectedMatch, result.getOrDie());
      Assertions.assertEq('Should have the expected state', expectedData, state.get());
    });
  };

  const actionA = handleAction('a');
  const actionB = handleAction('b');

  Pipeline.async({}, [
    sTestMatchNone([], {}),
    sTestMatchNone([], event({ keyCode: 65 })),
    sTestMatchNone([{ keyCode: 65, action: actionA }], event({ keyCode: 13 })),
    sTestMatch([{ keyCode: 65, action: actionA }], event({ keyCode: 65 }), [ 'a' ]),
    sTestMatch([{ keyCode: 65, shiftKey: true, action: actionA }], event({ keyCode: 65, shiftKey: true }), [ 'a' ]),
    sTestMatch([{ keyCode: 65, altKey: true, action: actionA }], event({ keyCode: 65, altKey: true }), [ 'a' ]),
    sTestMatch([{ keyCode: 65, ctrlKey: true, action: actionA }], event({ keyCode: 65, ctrlKey: true }), [ 'a' ]),
    sTestMatch([{ keyCode: 65, metaKey: true, action: actionA }], event({ keyCode: 65, metaKey: true }), [ 'a' ]),
    sTestMatch(
      [
        { keyCode: 65, ctrlKey: true, metaKey: true, altKey: true, action: actionA },
        { keyCode: 65, ctrlKey: true, metaKey: true, action: actionB }
      ],
      event({ keyCode: 65, metaKey: true, ctrlKey: true }),
      [ 'b' ]
    ),
    sTestExecute(
      [
        { keyCode: 65, ctrlKey: true, metaKey: true, altKey: true, action: actionA },
        { keyCode: 65, ctrlKey: true, metaKey: true, action: actionB }
      ],
      event({ keyCode: 65, metaKey: true, ctrlKey: true }),
      [ 'b' ],
      { shiftKey: false, altKey: false, ctrlKey: true, metaKey: true, keyCode: 65, action: actionB }
    ),
    Logger.t('Action wrapper helper', Step.sync(function () {
      const action = MatchKeys.action(function () {
        return Array.prototype.slice.call(arguments, 0);
      }, 1, 2, 3);

      Assertions.assertEq('Should return the parameters passed in', [ 1, 2, 3 ], action());
    }))
  ], function () {
    success();
  }, failure);
});
