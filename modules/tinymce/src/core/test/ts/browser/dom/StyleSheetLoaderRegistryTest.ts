import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as StyleSheetLoaderRegistry from 'tinymce/core/dom/StyleSheetLoaderRegistry';
import { Document, Element, ShadowDom } from '@ephox/sugar';
import { Testable } from '@ephox/dispute';
import { document } from '@ephox/dom-globals';
import { StyleSheetLoader } from 'tinymce/core/api/dom/StyleSheetLoader';

UnitTest.test('StyleSheetLoaderRegistry - same element gets same instance (document)', () => {
  const sslr = StyleSheetLoaderRegistry.create();
  const ssl1: StyleSheetLoader = sslr.forElement(Document.getDocument(), {});
  const ssl2: StyleSheetLoader = sslr.forElement(Document.getDocument(), {});
  Assert.eq('Should be the same', ssl1, ssl2, Testable.tStrict);
});

UnitTest.test('StyleSheetLoaderRegistry - same element gets same instance (ShadowRoot)', () => {
  if (!ShadowDom.isSupported()) {
    return;
  }

  const div = document.createElement('div');
  const sr = div.attachShadow({ mode: 'open' });
  const innerDiv = document.createElement('div');
  sr.appendChild(innerDiv);

  const sslr = StyleSheetLoaderRegistry.create();

  const ssl1: StyleSheetLoader = sslr.forElement(Element.fromDom(sr), {});
  const ssl2: StyleSheetLoader = sslr.forElement(Element.fromDom(sr), {});
  const ssl3: StyleSheetLoader = sslr.forElement(Element.fromDom(innerDiv), {});
  const ssl4: StyleSheetLoader = sslr.forElement(Element.fromDom(innerDiv), {});
  Assert.eq('Should be the same: shadow root x 2', ssl1, ssl2, Testable.tStrict);
  Assert.eq('Should be the same: shadow root and child', ssl2, ssl3, Testable.tStrict);
  Assert.eq('Should be the same: child x 2', ssl3, ssl4, Testable.tStrict);

  const sslDoc: StyleSheetLoader = sslr.forElement(Document.getDocument(), {});

  Assert.eq('Loader for document should be different to loader for shadow root child', false, sslDoc === ssl4);
});
