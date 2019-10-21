import Element from 'ephox/sugar/api/node/Element';
import * as Fragment from 'ephox/sugar/api/node/Fragment';
import * as Html from 'ephox/sugar/api/properties/Html';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import { UnitTest, assert } from '@ephox/bedrock-client';

UnitTest.test('FragmentTest', function () {
  const fragment = Fragment.fromElements([
    Element.fromHtml('<span>Hi</span>'),
    Element.fromTag('br'),
    Element.fromHtml('<p>One</p>')
  ]);

  const container = Element.fromTag('div');
  Insert.append(container, fragment);

  assert.eq('<span>Hi</span><br><p>One</p>', Html.get(container));
});
