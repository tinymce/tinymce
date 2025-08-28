import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as SandHTMLElement from 'ephox/sand/api/SandHTMLElement';

describe('HtmlElementTest', () => {
  context('isPrototypeOf', () => {
    it('non elements should be false', () => {
      assert.isFalse(SandHTMLElement.isPrototypeOf(null));
      assert.isFalse(SandHTMLElement.isPrototypeOf(undefined));
      assert.isFalse(SandHTMLElement.isPrototypeOf('a string'));
      assert.isFalse(SandHTMLElement.isPrototypeOf({}));
    });

    it('nodes should be false', () => {
      const text = document.createTextNode('text');
      const comment = document.createComment('comment');
      const frag = document.createDocumentFragment();
      assert.isFalse(SandHTMLElement.isPrototypeOf(text));
      assert.isFalse(SandHTMLElement.isPrototypeOf(comment));
      assert.isFalse(SandHTMLElement.isPrototypeOf(frag));
    });

    it('SVG elements should be false', () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      assert.isFalse(SandHTMLElement.isPrototypeOf(svg));
    });

    it('same window elements should be true', () => {
      const div = document.createElement('div');
      const a = document.createElement('a');
      assert.isTrue(SandHTMLElement.isPrototypeOf(div));
      assert.isTrue(SandHTMLElement.isPrototypeOf(a));
    });

    it('TINY-7374: different window elements should be true', () => {
      const span = document.createElement('span');      // HTMLSpanElement
      const a = document.createElement('a');            // HTMLAnchorElement
      const strong = document.createElement('strong');  // HTMLElement
      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument;
      if (iframeDoc === null) {
        assert.fail('Iframe document is not available');
        return;
      }

      iframeDoc.open();
      iframeDoc.write('<html><body></body></html>');
      iframeDoc.close();

      iframeDoc.body.appendChild(span);
      iframeDoc.body.appendChild(a);
      iframeDoc.body.appendChild(strong);
      assert.isTrue(SandHTMLElement.isPrototypeOf(span));
      assert.isTrue(SandHTMLElement.isPrototypeOf(a));
      assert.isTrue(SandHTMLElement.isPrototypeOf(strong));

      document.body.removeChild(iframe);
    });
  });
});
