import Element from 'ephox/sugar/api/node/Element';
import Fragment from 'ephox/sugar/api/node/Fragment';
import Html from 'ephox/sugar/api/properties/Html';
import Insert from 'ephox/sugar/api/dom/Insert';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('FragmentTest', function() {
  var fragment = Fragment.fromElements([
    Element.fromHtml('<span>Hi</span>'),
    Element.fromTag('br'),
    Element.fromHtml('<p>One</p>')
  ]);

  var container = Element.fromTag('div');
  Insert.append(container, fragment);

  assert.eq('<span>Hi</span><br><p>One</p>', Html.get(container));
});

