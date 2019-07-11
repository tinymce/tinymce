import { assert, UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { HTMLElement } from 'ephox/sand/api/Main';

UnitTest.test('HtmlElementTest', function () {
  const span = document.createElement('div');
  assert.eq(false, HTMLElement.isPrototypeOf(null));
  assert.eq(false, HTMLElement.isPrototypeOf(undefined));
  assert.eq(false, HTMLElement.isPrototypeOf('a string'));
  assert.eq(false, HTMLElement.isPrototypeOf({}));
  assert.eq(true, HTMLElement.isPrototypeOf(span));
});
