import { Assert, UnitTest } from '@ephox/bedrock-client';

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
    Assert.eq(() => 'Incorrect element. \nExpected: ' + Html.getOuter(expected) + '\nWas: ' + Html.getOuter(actual), true, Compare.eq(expected, actual));
  };

  const checkLast = (label: string, expected: SugarElement<Node>, root: SugarElement<Node>) => {
    const actual = CursorPosition.last(root).getOrDie('No cursor position found for: ' + label);
    Assert.eq(() => 'Incorrect element. \nExpected: ' + Html.getOuter(expected) + '\nWas: ' + Html.getOuter(actual), true, Compare.eq(expected, actual));
  };

  checkFirst('First of container (should skip empty container)', child3a, container);
  checkFirst('First of span', child3a, child3);
  checkLast('Last of container (should be <br>)', child4, container);
  checkLast('Last of span (should be <br>)', child3d, child3);

  Assert.eq('', 5, Awareness.getEnd(container));
  Assert.eq('', 2, Awareness.getEnd(child3a));
  Assert.eq('', 1, Awareness.getEnd(SugarElement.fromTag('img')));

  Assert.eq('', true, Awareness.isEnd(container, 5));
  Assert.eq('', false, Awareness.isEnd(container, 4));

  Assert.eq('', true, Awareness.isStart(container, 0));
  Assert.eq('', false, Awareness.isStart(container, 1));

  Assert.eq('', true, Edge.isAtLeftEdge(container, child3a, 0));
  Assert.eq('', false, Edge.isAtLeftEdge(container, child2, 1));

  // INVESTIGATE: Not sure if offset here should be 0 or 1.
  Assert.eq('', true, Edge.isAtRightEdge(container, child4, 0));

  const container2 = SugarElement.fromTag('p');
  const child2_1 = SugarElement.fromHtml('<span contenteditable="false">AAA</span>');
  const child2_2 = SugarElement.fromText('BBB');
  const child2_3 = SugarElement.fromHtml('<span contenteditable="false">CCC</span>');
  InsertAll.append(container2, [ child2_1, child2_2, child2_3 ]);
  checkFirst('First of container2 should be first CEF', child2_1, container2);
  checkLast('Last of container2 should be last CEF', child2_3, container2);

});
