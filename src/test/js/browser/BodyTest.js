import Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import Insert from 'ephox/sugar/api/dom/Insert';
import Remove from 'ephox/sugar/api/dom/Remove';
import SelectorFind from 'ephox/sugar/api/search/SelectorFind';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('BodyTest', function() {
  var body = SelectorFind.first('body').getOrDie();

  var div = Element.fromTag('div');
  var child = Element.fromTag('span');
  var text = Element.fromText('hi');
  Insert.append(child, text);
  Insert.append(div, child);
  assert.eq(false, Body.inBody(div));
  assert.eq(false, Body.inBody(child));
  assert.eq(false, Body.inBody(text));

  Insert.append(body, div);
  assert.eq(true, Body.inBody(div));
  assert.eq(true, Body.inBody(child));
  assert.eq(true, Body.inBody(text));
  assert.eq(true, Body.inBody(body));

  Remove.remove(div);
});

