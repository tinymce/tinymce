import * as Compare from 'ephox/sugar/api/dom/Compare';
import * as InsertAll from 'ephox/sugar/api/dom/InsertAll';
import Element from 'ephox/sugar/api/node/Element';
import * as Html from 'ephox/sugar/api/properties/Html';
import * as Awareness from 'ephox/sugar/api/selection/Awareness';
import * as CursorPosition from 'ephox/sugar/api/selection/CursorPosition';
import * as Edge from 'ephox/sugar/api/selection/Edge';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('Browser Test: CursorPositionTest', function() {
  var container = Element.fromTag('div');
  var child1 = Element.fromText('');
  var child2 = Element.fromText(' ');
  var child3 = Element.fromTag('span');

  var child3a = Element.fromText('3a');
  var child3b = Element.fromText('3b');
  var child3c = Element.fromText('');
  var child3d = Element.fromTag('br');
  var child3e = Element.fromText('');
  InsertAll.append(child3, [ child3a, child3b, child3c, child3d, child3e ]);

  var child4 = Element.fromTag('br');
  var child5 = Element.fromText('');

  InsertAll.append(container, [ child1, child2, child3, child4, child5 ]);

  var checkFirst = function (label, expected, root) {
    var actual = CursorPosition.first(root).getOrDie('No cursor position found for: ' + label);
    assert.eq(true, Compare.eq(expected, actual), 'Incorrect element. \nExpected: ' + Html.getOuter(expected) + '\nWas: ' + Html.getOuter(actual));
  }

  var checkLast = function (label, expected, root) {
    var actual = CursorPosition.last(root).getOrDie('No cursor position found for: ' + label);
    assert.eq(true, Compare.eq(expected, actual), 'Incorrect element. \nExpected: ' + Html.getOuter(expected) + '\nWas: ' + Html.getOuter(actual));
  }

  checkFirst('First of container (should skip empty container)', child3a, container);
  checkFirst('First of span', child3a, child3);
  checkLast('Last of container (should be <br>)', child4, container);
  checkLast('Last of span (should be <br>)', child3d, child3);

  assert.eq(5, Awareness.getEnd(container));
  assert.eq(2, Awareness.getEnd(child3a));
  assert.eq(1, Awareness.getEnd(Element.fromTag('img')));

  assert.eq(true, Awareness.isEnd(container, 5));
  assert.eq(false, Awareness.isEnd(container, 4));

  assert.eq(true, Awareness.isStart(container, 0));
  assert.eq(false, Awareness.isStart(container, 1));

  assert.eq(true, Edge.isAtLeftEdge(container, child3a, 0));
  assert.eq(false, Edge.isAtLeftEdge(container, child2, 1));

  // INVESTIGATE: Not sure if offset here should be 0 or 1.
  assert.eq(true, Edge.isAtRightEdge(container, child4, 0));
});

