import * as Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as SelectorFind from 'ephox/sugar/api/search/SelectorFind';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('BodyTest', function () {
  const body = SelectorFind.first('body').getOrDie();

  const div = Element.fromTag('div');
  const child = Element.fromTag('span');
  const text = Element.fromText('hi');
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
