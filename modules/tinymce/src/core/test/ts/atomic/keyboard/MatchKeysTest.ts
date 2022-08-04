import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Cell } from '@ephox/katamari';
import { assert } from 'chai';

import * as MatchKeys from 'tinymce/core/keyboard/MatchKeys';

type KeyPattern = MatchKeys.KeyPattern;

describe('atomic.tinymce.core.keyboard.MatchKeysTest', () => {
  const state = Cell<string[]>([]);

  const event = (evt: Partial<KeyboardEvent>): KeyboardEvent => {
    return {
      shiftKey: false,
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      keyCode: 0,
      ...evt
    } as KeyboardEvent;
  };

  const handleAction = (value: string) => {
    return () => {
      state.set(state.get().concat([ value ]));
      return true;
    };
  };

  const testMatch = (label: string, patterns: KeyPattern[], event: KeyboardEvent, expectedData: string[]) => {
    return it(label, () => {
      state.set([]);

      const matches = MatchKeys.match(patterns, event);
      assert.isAbove(matches.length, 0, 'Should have some matches');

      Arr.find(matches, (pattern) => {
        return pattern.action();
      });

      assert.deepEqual(state.get(), expectedData, 'Should have the expected state');
    });
  };

  const testMatchNone = (label: string, patterns: KeyPattern[], event: KeyboardEvent) => {
    it(label, () => {
      assert.lengthOf(MatchKeys.match(patterns, event), 0, 'Should not produce any matches');
    });
  };

  const testExecute = (label: string, patterns: KeyPattern[], event: KeyboardEvent, expectedData: string[], expectedMatch: Required<KeyPattern>) => {
    return it(label, () => {
      state.set([]);

      const result = MatchKeys.execute(patterns, event);
      assert.deepEqual(result.getOrDie(), expectedMatch, 'Should be expected match');
      assert.deepEqual(state.get(), expectedData, 'Should have the expected state');
    });
  };

  const actionA = handleAction('a');
  const actionB = handleAction('b');

  context('match', () => {
    testMatchNone('no patterns with no data', [], {} as KeyboardEvent);
    testMatchNone('no patterns with valid keycode', [], event({ keyCode: 65 }));
    testMatchNone(`pattern with keycode that doesn\'t match`, [{ keyCode: 65, action: actionA }], event({ keyCode: 13 }));

    testMatch('pattern with matching keycode', [{ keyCode: 65, action: actionA }], event({ keyCode: 65 }), [ 'a' ]);
    testMatch(
      'pattern with matching keycode and shift key modifier',
      [{ keyCode: 65, shiftKey: true, action: actionA }],
      event({ keyCode: 65, shiftKey: true }),
      [ 'a' ]
    );
    testMatch(
      'pattern with matching keycode and alt key modifier',
      [{ keyCode: 65, altKey: true, action: actionA }],
      event({ keyCode: 65, altKey: true }),
      [ 'a' ]
    );
    testMatch(
      'pattern with matching keycode and ctrl key modifier',
      [{ keyCode: 65, ctrlKey: true, action: actionA }],
      event({ keyCode: 65, ctrlKey: true }),
      [ 'a' ]);
    testMatch(
      'pattern with matching keycode and meta key modifier',
      [{ keyCode: 65, metaKey: true, action: actionA }],
      event({ keyCode: 65, metaKey: true }),
      [ 'a' ]);
    testMatch(
      'multiple patterns with matching keycode and modifier',
      [
        { keyCode: 65, ctrlKey: true, metaKey: true, altKey: true, action: actionA },
        { keyCode: 65, ctrlKey: true, metaKey: true, action: actionB }
      ],
      event({ keyCode: 65, metaKey: true, ctrlKey: true }),
      [ 'b' ]
    );
  });

  context('execute', () => {
    testExecute(
      'executes correct function based on meta keys',
      [
        { keyCode: 65, ctrlKey: true, metaKey: true, altKey: true, action: actionA },
        { keyCode: 65, ctrlKey: true, metaKey: true, action: actionB }
      ],
      event({ keyCode: 65, metaKey: true, ctrlKey: true }),
      [ 'b' ],
      { shiftKey: false, altKey: false, ctrlKey: true, metaKey: true, keyCode: 65, action: actionB }
    );
  });

  it('Action wrapper helper', () => {
    const action = MatchKeys.action((...rest: any[]) => {
      return Array.prototype.slice.call(rest, 0);
    }, 1, 2, 3);

    assert.deepEqual(action(), [ 1, 2, 3 ], 'Should return the parameters passed in');
  });
});
