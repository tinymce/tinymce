import { context, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { assert } from 'chai';

import Schema from 'tinymce/core/api/html/Schema';
import { getSanitizer, MimeType } from 'tinymce/core/html/Sanitization';

describe('browser.tinymce.core.html.SanitizationTest', () => {
  context('Sanitize html', () => {
    const isSafari = PlatformDetection.detect().browser.isSafari();

    const testHtmlSanitizer = (testCase: { input: string; expected: string; mimeType: MimeType; sanitize?: boolean }) => {
      const sanitizer = getSanitizer({ sanitize: testCase.sanitize ?? true }, Schema());

      const body = document.createElement('body');
      body.innerHTML = testCase.input;
      sanitizer.sanitizeHtmlElement(body, testCase.mimeType);

      assert.equal(body.innerHTML, testCase.expected);
    };

    it('Sanitize iframe HTML', () => testHtmlSanitizer({
      input: '<iframe src="x"><script>alert(1)</script></iframe><iframe src="javascript:alert(1)"></iframe>',
      // Safari seems to encode the contents of iframes
      expected: isSafari ? '<iframe src="x">&lt;script&gt;alert(1)&lt;/script&gt;</iframe><iframe></iframe>' : '<iframe></iframe>',
      mimeType: 'text/html'
    }));

    it('Disabled sanitization of iframe HTML', () => testHtmlSanitizer({
      input: '<iframe src="x"><script>alert(1)</script></iframe><iframe src="javascript:alert(1)"></iframe>',
      // Safari seems to encode the contents of iframes
      expected: isSafari ? '<iframe src="x">&lt;script&gt;alert(1)&lt;/script&gt;</iframe><iframe></iframe>' : '<iframe src="x"><script>alert(1)</script></iframe><iframe></iframe>',
      mimeType: 'text/html',
      sanitize: false
    }));
  });

  context('Santitize non-html', () => {
    const testNamespaceSanitizer = (testCase: { input: string; expected: string; sanitize?: boolean }) => {
      const sanitizer = getSanitizer({ sanitize: testCase.sanitize ?? true }, Schema());

      const body = document.createElement('body');
      body.innerHTML = testCase.input;
      sanitizer.sanitizeNamespaceElement(body);

      assert.equal(body.innerHTML, testCase.expected);
    };

    it('Sanitize SVG', () => testNamespaceSanitizer({
      input: '<svg><script>alert(1)</script><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"></svg>',
      expected: '<svg><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"></circle></svg>'
    }));

    it('Sanitize SVG with xlink', () => testNamespaceSanitizer({
      input: '<svg><script>alert(1)</script><a xlink:href="url"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"></a></svg>',
      expected: '<svg><a xlink:href="url"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"></circle></a></svg>'
    }));

    it('Sanitize SVG with mixed HTML', () => testNamespaceSanitizer({
      input: '<svg><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"><desc><script>alert(1)</script><p>hello</p></circle></a></svg>',
      expected: '<svg><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"><desc><p>hello</p></desc></circle></svg>'
    }));

    it('Sanitize SVG with xlink with script url', () => testNamespaceSanitizer({
      input: '<svg><script>alert(1)</script><a xlink:href="javascript:alert(1)"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"></a></svg>',
      expected: '<svg><a><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"></circle></a></svg>'
    }));

    it('Disabled sanitization of SVG', () => testNamespaceSanitizer({
      input: '<svg><script>alert(1)</script><a xlink:href="javascript:alert(1)"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"></a></svg>',
      expected: '<svg><script>alert(1)</script><a xlink:href="javascript:alert(1)"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"></circle></a></svg>',
      sanitize: false
    }));
  });
});
