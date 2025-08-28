import { Assert, UnitTest } from '@ephox/bedrock-client';

import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as SugarText from 'ephox/sugar/api/node/SugarText';
import * as TextContent from 'ephox/sugar/api/properties/TextContent';

UnitTest.test('TextContentTest', () => {
  const element = SugarElement.fromHtml('<p>Hello <strong>World!</strong></p>');
  Assert.eq('', 'Hello World!', TextContent.get(element));
  TextContent.set(element, 'My text value');
  Assert.eq('', 'My text value', TextContent.get(element));

  const textnode = SugarElement.fromText('This is just text');
  Assert.eq('', 'This is just text', TextContent.get(textnode));
  TextContent.set(textnode, 'new text value');
  Assert.eq('', 'new text value', TextContent.get(textnode));
  Assert.eq('', 'new text value', SugarText.get(textnode));

  const comment = SugarElement.fromDom(document.createComment('commenting checking'));
  Assert.eq('', 'commenting checking', TextContent.get(comment));
  TextContent.set(comment, 'new comment value');
  Assert.eq('', 'new comment value', TextContent.get(comment));
});
