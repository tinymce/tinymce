import { assert, UnitTest } from '@ephox/bedrock-client';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import Element from 'ephox/sugar/api/node/Element';
import * as Fragment from 'ephox/sugar/api/node/Fragment';
import * as Html from 'ephox/sugar/api/properties/Html';

UnitTest.test('FragmentTest', () => {
  const fragment = Fragment.fromElements([
    Element.fromHtml('<span>Hi</span>'),
    Element.fromTag('br'),
    Element.fromHtml('<p>One</p>')
  ]);

  const container = Element.fromTag('div');
  Insert.append(container, fragment);

  assert.eq('<span>Hi</span><br><p>One</p>', Html.get(container));
});
