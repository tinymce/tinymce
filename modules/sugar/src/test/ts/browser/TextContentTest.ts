import { assert, UnitTest } from '@ephox/bedrock-client';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as SugarText from 'ephox/sugar/api/node/SugarText';
import * as TextContent from 'ephox/sugar/api/properties/TextContent';

UnitTest.test('TextContentTest', () => {
  const element = SugarElement.fromHtml('<p>Hello <strong>World!</strong></p>');
  assert.eq('Hello World!', TextContent.get(element));
  TextContent.set(element, 'My text value');
  assert.eq('My text value', TextContent.get(element));

  const textnode = SugarElement.fromText('This is just text');
  assert.eq('This is just text', TextContent.get(textnode));
  TextContent.set(textnode, 'new text value');
  assert.eq('new text value', TextContent.get(textnode));
  assert.eq('new text value', SugarText.get(textnode));

  const comment = SugarElement.fromDom(document.createComment('commenting checking'));
  assert.eq('commenting checking', TextContent.get(comment));
  TextContent.set(comment, 'new comment value');
  assert.eq('new comment value', TextContent.get(comment));
});
