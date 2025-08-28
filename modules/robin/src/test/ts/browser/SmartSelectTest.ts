import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Compare, Hierarchy, Insert, InsertAll, Remove, SugarBody, SugarElement } from '@ephox/sugar';

import * as DomSmartSelect from 'ephox/robin/api/dom/DomSmartSelect';

UnitTest.test('SmartSelectTest', () => {
  const editor = SugarElement.fromTag('div');

  /*
   * We_
   * <p>
   *  are_
   *  <span>
   *    g
   *  </span>
   *  oi
   *  <b>
   *    ng
   *  </b>
   * </p>
   * <p>
   *  to_say
   *  _
   *  "yes"
   * </p>
   */
  const populate = () => {
    const we = SugarElement.fromText('We ');
    const p1 = SugarElement.fromTag('p');
    const are = SugarElement.fromText('are ');
    const s1 = SugarElement.fromTag('span');
    const g = SugarElement.fromText('g');
    const oi = SugarElement.fromText('oi');
    const b1 = SugarElement.fromTag('b');
    const ng = SugarElement.fromText('ng');
    const p2 = SugarElement.fromTag('p');
    const toSay = SugarElement.fromText('to say');
    const space = SugarElement.fromText(' ');
    const yes = SugarElement.fromText('"yes"');

    InsertAll.append(p1, [ are, s1, oi, b1 ]);
    InsertAll.append(p2, [ toSay, space, yes ]);
    InsertAll.append(s1, [ g ]);
    InsertAll.append(b1, [ ng ]);
    InsertAll.append(editor, [ we, p1, p2 ]);
    Insert.append(SugarBody.body(), editor);
  };

  const cleanup = () => {
    Remove.remove(editor);
  };

  interface ExpectedPos {
    element: number[];
    offset: number;
  }

  interface Expected {
    word: string;
    start: ExpectedPos;
    finish: ExpectedPos;
  }

  const check = (expected: Expected, path: number[], offset: number) => {
    const start = Hierarchy.follow(editor, path).getOrDie('Looking for start of smart select');
    const actual = DomSmartSelect.word(start, offset);
    actual.fold(() => {
      throw new Error('Expected to select word: ' + expected.word);
    }, (act) => {
      const expStart = Hierarchy.follow(editor, expected.start.element).getOrDie('Could not find expected start');
      const expFinish = Hierarchy.follow(editor, expected.finish.element).getOrDie('Could not find expected finish');
      Assert.eq('', true, Compare.eq(expStart, act.startContainer));
      Assert.eq('', expected.start.offset, act.startOffset);
      Assert.eq('', true, Compare.eq(expFinish, act.endContainer));
      Assert.eq('', expected.finish.offset, act.endOffset);

      const range = document.createRange();
      range.setStart(act.startContainer.dom, act.startOffset);
      range.setEnd(act.endContainer.dom, act.endOffset);
      Assert.eq('', expected.word, range.toString());
    });
  };

  const words = {
    we: {
      start: { element: [ 0 ], offset: 0 },
      finish: { element: [ 0 ], offset: 'We'.length },
      word: 'We'
    },
    are: {
      start: { element: [ 1, 0 ], offset: 0 },
      finish: { element: [ 1, 0 ], offset: 'are'.length },
      word: 'are'
    },
    going: {
      start: { element: [ 1, 1, 0 ], offset: ''.length },
      finish: { element: [ 1, 3, 0 ], offset: 'ng'.length },
      word: 'going'
    },
    to: {
      start: { element: [ 2, 0 ], offset: ''.length },
      finish: { element: [ 2, 0 ], offset: 'to'.length },
      word: 'to'
    },
    say: {
      start: { element: [ 2, 0 ], offset: 'to '.length },
      finish: { element: [ 2, 0 ], offset: 'to say'.length },
      word: 'say'
    },
    yes: {
      start: { element: [ 2, 2 ], offset: '"'.length },
      finish: { element: [ 2, 2 ], offset: '"yes'.length },
      word: 'yes'
    }
  };

  populate();

  check(words.we, [ 0 ], 1);
  check(words.are, [ 1, 0 ], 1);
  check(words.are, [ 1, 0 ], 2);
  check(words.going, [ 1, 1, 0 ], 1);
  check(words.to, [ 2, 0 ], 1);
  check(words.say, [ 2, 0 ], 'to s'.length);
  check(words.yes, [ 2, 2 ], '"y'.length);

  cleanup();
});
