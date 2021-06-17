import { assert, UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as DomStructure from 'ephox/robin/api/dom/DomStructure';

UnitTest.test('DomStructureTest', () => {
  const expectInlineElements = [ 'span', 'em', 'strong', 'b', 'i', 'a' ];

  const getInline = (el: string) => {
    const element = SugarElement.fromTag(el);
    return DomStructure.isInline(element);
  };
  Arr.each(expectInlineElements, (e) => {
    assert.eq(true, getInline(e), `Expected ${e} to be inline, but it wasn't`);
  });

  const expectNonInlineElements = [ 'p', 'div', 'blockquote', 'h1', 'h2', 'h3', 'ul', 'li' ];
  Arr.each(expectNonInlineElements, (e) => {
    assert.eq(false, getInline(e), `Expected ${e} to not be inline, but it was`);
  });
});
