import { describe, it } from '@ephox/bedrock-client';
import { SugarDocument, SugarElement, SugarShadowDom } from '@ephox/sugar';
import { assert } from 'chai';

import StyleSheetLoader from 'tinymce/core/api/dom/StyleSheetLoader';
import * as StyleSheetLoaderRegistry from 'tinymce/core/dom/StyleSheetLoaderRegistry';

describe('browser.tinymce.core.dom.StyleSheetLoaderRegistry', () => {
  it('same element gets same instance (document)', () => {
    const sslr = StyleSheetLoaderRegistry.create();
    const ssl1: StyleSheetLoader = sslr.forElement(SugarDocument.getDocument(), {});
    const ssl2: StyleSheetLoader = sslr.forElement(SugarDocument.getDocument(), {});
    assert.strictEqual(ssl2, ssl1, 'Should be the same');
  });

  it('same element gets same instance (ShadowRoot)', function () {
    if (!SugarShadowDom.isSupported()) {
      this.skip();
    }

    const div = document.createElement('div');
    const sr = div.attachShadow({ mode: 'open' });
    const innerDiv = document.createElement('div');
    sr.appendChild(innerDiv);

    const sslr = StyleSheetLoaderRegistry.create();

    const ssl1: StyleSheetLoader = sslr.forElement(SugarElement.fromDom(sr), {});
    const ssl2: StyleSheetLoader = sslr.forElement(SugarElement.fromDom(sr), {});
    const ssl3: StyleSheetLoader = sslr.forElement(SugarElement.fromDom(innerDiv), {});
    const ssl4: StyleSheetLoader = sslr.forElement(SugarElement.fromDom(innerDiv), {});
    assert.strictEqual(ssl2, ssl1, 'Should be the same: shadow root x 2');
    assert.strictEqual(ssl3, ssl2, 'Should be the same: shadow root and child');
    assert.strictEqual(ssl4, ssl3, 'Should be the same: child x 2');

    const sslDoc: StyleSheetLoader = sslr.forElement(SugarDocument.getDocument(), {});

    assert.notStrictEqual(sslDoc, ssl4, 'Loader for document should be different to loader for shadow root child');
  });
});
