import Attr from 'ephox/sugar/api/properties/Attr';
import Body from 'ephox/sugar/api/node/Body';
import Compare from 'ephox/sugar/api/dom/Compare';
import Element from 'ephox/sugar/api/node/Element';
import Focus from 'ephox/sugar/api/dom/Focus';
import Insert from 'ephox/sugar/api/dom/Insert';
import Remove from 'ephox/sugar/api/dom/Remove';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('FocusTest', function() {
  var div = Element.fromTag('div');
  Attr.set(div, 'tabindex', '-1');

  var input = Element.fromTag('input');

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

