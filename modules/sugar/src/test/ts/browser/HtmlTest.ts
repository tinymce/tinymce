import { assert, UnitTest } from '@ephox/bedrock-client';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Html from 'ephox/sugar/api/properties/Html';
import Div from 'ephox/sugar/test/Div';

UnitTest.test('HtmlTest', () => {
  // checks that Html.getOuter does not fiddle with the dom
  const c = Div();
  const container = Div();
  Insert.append(container, c);
  assert.eq('<div></div>', Html.getOuter(c));

  assert.eq(true, c.dom().parentNode === container.dom(), 'getOuter must not change the DOM');

  const content = '<p>stuff</p>';
  Html.set(c, content);
  assert.eq(content, c.dom().innerHTML);
  assert.eq(content, Html.get(c));
});
