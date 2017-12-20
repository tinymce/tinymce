import Html from 'ephox/sugar/api/properties/Html';
import Insert from 'ephox/sugar/api/dom/Insert';
import Div from 'ephox/sugar/test/Div';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('HtmlTest', function() {
  // checks that Html.getOuter does not fiddle with the dom
  var c = Div();
  var container = Div();
  Insert.append(container, c);
  assert.eq('<div></div>', Html.getOuter(c));

  assert.eq(true, c.dom().parentNode == container.dom(), 'getOuter must not change the DOM');

  var content = '<p>stuff</p>';
  Html.set(c, content);
  assert.eq(content, c.dom().innerHTML);
  assert.eq(content, Html.get(c));
});

