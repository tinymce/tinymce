import * as Compare from 'ephox/sugar/api/dom/Compare';
import Element from 'ephox/sugar/api/node/Element';
import * as Link from 'ephox/sugar/api/dom/Link';
import { UnitTest, assert } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';

UnitTest.test('LinkTest', function() {
  var realDoc = Element.fromDom(document);
  var headNodes = document.head.children.length;

  var firstLink = Link.addStylesheet('fake://url1/');
  var secondLink = Link.addStylesheet('fake://url2/', realDoc);

  var assertStylesheetLink = function (raw, url) {
    assert.eq(url, raw.href);
    assert.eq('stylesheet', raw.rel);
    assert.eq('text/css', raw.type);
  };


  assert.eq(2, document.head.children.length - headNodes);

  // counting headNodes as "zero"
  var url1 = document.head.children[headNodes];
  var url2 = document.head.children[headNodes + 1];
  assert.eq(true, Compare.eq(firstLink, Element.fromDom(url1)), 'first link element was not equal');
  assert.eq(true, Compare.eq(secondLink, Element.fromDom(url2)), 'second link element was not equal');
  assertStylesheetLink(url1, 'fake://url1/');
  assertStylesheetLink(url2, 'fake://url2/');

  document.head.removeChild(url1);
  document.head.removeChild(url2);
});

