import * as InsertAll from 'ephox/sugar/api/dom/InsertAll';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import { Selection } from 'ephox/sugar/api/selection/Selection';
import * as WindowSelection from 'ephox/sugar/api/selection/WindowSelection';
import { UnitTest, assert } from '@ephox/bedrock';
import { window } from '@ephox/dom-globals';

UnitTest.test('Browser Test: SelectionRectanglesTest', function () {
  const p1 = Element.fromHtml('<p>This is the <strong>first</strong> paragraph</p>');
  const p2 = Element.fromHtml('<p>This is the <em>second</em> paragraph</p>');

  InsertAll.append(Body.body(), [ p1, p2 ]);

  const selP1 = Selection.exact(p1, 0, p1, 1);
  const selP2 = Selection.exact(p2, 0, p2, 1);

  const rect1 = WindowSelection.getFirstRect(window, selP1).getOrDie(
    'There should be a rectangle for paragraph 1'
  );

  const rect2 = WindowSelection.getFirstRect(window, selP2).getOrDie(
    'There should be a rectangle for paragraph 2'
  );

  assert.eq(
    true, rect1.top() < rect2.top(), 'Rect 1 should be above Rect 2. (1) was ' +
    rect1.top() + ', and (2) was ' + rect2.top()
  );

  const bounds1 = WindowSelection.getBounds(window, selP1).getOrDie(
    'There should be bounds for paragraph 1'
  );
  const bounds2 = WindowSelection.getBounds(window, selP2).getOrDie(
    'There should be bounds for paragraph 2'
  );
  assert.eq(
    true,
    bounds1.top() < bounds2.top(),
    'Bounds 1 should be above bound 2. (1) was ' + bounds1.top() + ', and (2)' +
    ' was ' + bounds2.top()
  );

  Remove.remove(p1);
  Remove.remove(p2);
});
