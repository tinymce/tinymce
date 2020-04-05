import { assert, UnitTest } from '@ephox/bedrock-client';
import * as Compare from 'ephox/sugar/api/dom/Compare';
import * as Focus from 'ephox/sugar/api/dom/Focus';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import * as Attr from 'ephox/sugar/api/properties/Attr';

UnitTest.test('FocusTest', () => {
  const div = Element.fromTag('div');
  Attr.set(div, 'tabindex', '-1');

  const input = Element.fromTag('input');

  Insert.append(div, input);
  Insert.append(Body.body(), div);

  Focus.focus(input);
  assert.eq(true, Compare.eq(Focus.active().getOrDie(), input));
  Focus.focus(div);
  assert.eq(true, Compare.eq(Focus.active().getOrDie(), div));
  Focus.focus(input);
  assert.eq(true, Compare.eq(Focus.active().getOrDie(), input));
  Focus.focusInside(div);
  assert.eq(true, Compare.eq(Focus.active().getOrDie(), input));
  Focus.focusInside(input);
  assert.eq(true, Compare.eq(Focus.active().getOrDie(), input));
  Focus.focus(div);
  assert.eq(true, Compare.eq(Focus.active().getOrDie(), div));

  Remove.remove(div);
});
