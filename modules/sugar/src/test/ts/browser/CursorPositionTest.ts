import { assert, UnitTest } from '@ephox/bedrock-client';

import * as Compare from 'ephox/sugar/api/dom/Compare';
import * as InsertAll from 'ephox/sugar/api/dom/InsertAll';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as Html from 'ephox/sugar/api/properties/Html';
import * as Awareness from 'ephox/sugar/api/selection/Awareness';
import * as CursorPosition from 'ephox/sugar/api/selection/CursorPosition';
import * as Edge from 'ephox/sugar/api/selection/Edge';

UnitTest.test('Browser Test: CursorPositionTest', () => {
  const container = SugarElement.fromTag('div');
  const child1 = SugarElement.fromText('');
  const child2 = SugarElement.fromText(' ');
  const child3 = SugarElement.fromTag('span');

  const child3a = SugarElement.fromText('3a');
  const child3b = SugarElement.fromText('3b');
  const child3c = SugarElement.fromText('');
  const child3d = SugarElement.fromTag('br');
  const child3e = SugarElement.fromText('');
  InsertAll.append(child3, [ child3a, child3b, child3c, child3d, child3e ]);

  const child4 = SugarElement.fromTag('br');
  const child5 = SugarElement.fromText('');

  InsertAll.append(container, [ child1, child2, child3, child4, child5 ]);

  const checkFirst = (label: string, expected: SugarElement<Node>, root: SugarElement<Node>) => {
    const actual = CursorPosition.first(root).getOrDie('No cursor position found for: ' + label);
    assert.eq(true, Compare.eq(expected, actual), () => 'Incorrect element. \nExpected: ' + Html.getOuter(expected) + '\nWas: ' + Html.getOuter(actual));
  };

  const checkLast = (label: string, expected: SugarElement<Node>, root: SugarElement<Node>) => {
    const actual = CursorPosition.last(root).getOrDie('No cursor position found for: ' + label);
    assert.eq(true, Compare.eq(expected, actual), () => 'Incorrect element. \nExpected: ' + Html.getOuter(expected) + '\nWas: ' + Html.getOuter(actual));
  };

  checkFirst('First of container (should skip empty container)', child3a, container);
  checkFirst('First of span', child3a, child3);
  checkLast('Last of container (should be <br>)', child4, container);
  checkLast('Last of span (should be <br>)', child3d, child3);

  assert.eq(5, Awareness.getEnd(container));
  assert.eq(2, Awareness.getEnd(child3a));
  assert.eq(1, Awareness.getEnd(SugarElement.fromTag('img')));

  assert.eq(true, Awareness.isEnd(container, 5));
  assert.eq(false, Awareness.isEnd(container, 4));

  assert.eq(true, Awareness.isStart(container, 0));
  assert.eq(false, Awareness.isStart(container, 1));

  assert.eq(true, Edge.isAtLeftEdge(container, child3a, 0));
  assert.eq(false, Edge.isAtLeftEdge(container, child2, 1));

  // INVESTIGATE: Not sure if offset here should be 0 or 1.
  assert.eq(true, Edge.isAtRightEdge(container, child4, 0));
});
