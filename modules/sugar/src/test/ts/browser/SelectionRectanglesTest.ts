import { Assert, UnitTest } from '@ephox/bedrock-client';

import * as InsertAll from 'ephox/sugar/api/dom/InsertAll';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as SugarBody from 'ephox/sugar/api/node/SugarBody';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import { SimSelection } from 'ephox/sugar/api/selection/SimSelection';
import * as WindowSelection from 'ephox/sugar/api/selection/WindowSelection';

UnitTest.test('Browser Test: SelectionRectanglesTest', () => {
  const p1 = SugarElement.fromHtml('<p>This is the <strong>first</strong> paragraph</p>');
  const p2 = SugarElement.fromHtml('<p>This is the <em>second</em> paragraph</p>');

  InsertAll.append(SugarBody.body(), [ p1, p2 ]);

  const selP1 = SimSelection.exact(p1, 0, p1, 1);
  const selP2 = SimSelection.exact(p2, 0, p2, 1);

  const rect1 = WindowSelection.getFirstRect(window, selP1).getOrDie(
    'There should be a rectangle for paragraph 1'
  );

  const rect2 = WindowSelection.getFirstRect(window, selP2).getOrDie(
    'There should be a rectangle for paragraph 2'
  );

  Assert.eq('Rect 1 should be above Rect 2. (1) was ' + rect1.top + ', and (2) was ' + rect2.top, true, rect1.top < rect2.top);

  const bounds1 = WindowSelection.getBounds(window, selP1).getOrDie(
    'There should be bounds for paragraph 1'
  );
  const bounds2 = WindowSelection.getBounds(window, selP2).getOrDie(
    'There should be bounds for paragraph 2'
  );
  Assert.eq('Bounds 1 should be above bound 2. (1) was ' + bounds1.top + ', and (2)' + ' was ' + bounds2.top, true, bounds1.top < bounds2.top);

  Remove.remove(p1);
  Remove.remove(p2);
});
