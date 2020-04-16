import { assert, UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import Element from 'ephox/sugar/api/node/Element';
import * as Text from 'ephox/sugar/api/node/Text';
import * as TextContent from 'ephox/sugar/api/properties/TextContent';

UnitTest.test('TextContentTest', () => {
  const element = Element.fromHtml('<p>Hello <strong>World!</strong></p>');
  assert.eq('Hello World!', TextContent.get(element));
  TextContent.set(element, 'My text value');
  assert.eq('My text value', TextContent.get(element));

  const textnode = Element.fromText('This is just text');
  assert.eq('This is just text', TextContent.get(textnode));
  TextContent.set(textnode, 'new text value');
  assert.eq('new text value', TextContent.get(textnode));
  assert.eq('new text value', Text.get(textnode));

  const comment = Element.fromDom(document.createComment('commenting checking'));
  assert.eq('commenting checking', TextContent.get(comment));
  TextContent.set(comment, 'new comment value');
  assert.eq('new comment value', TextContent.get(comment));
});
