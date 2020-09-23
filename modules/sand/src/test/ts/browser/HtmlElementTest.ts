import { assert, UnitTest } from '@ephox/bedrock-client';
import { SandHTMLElement } from 'ephox/sand/api/Main';

UnitTest.test('HtmlElementTest', function () {
  const span = document.createElement('div');
  assert.eq(false, SandHTMLElement.isPrototypeOf(null));
  assert.eq(false, SandHTMLElement.isPrototypeOf(undefined));
  assert.eq(false, SandHTMLElement.isPrototypeOf('a string'));
  assert.eq(false, SandHTMLElement.isPrototypeOf({}));
  assert.eq(true, SandHTMLElement.isPrototypeOf(span));
});
