import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import Schema from 'tinymce/core/api/html/Schema';
import { getSanitizer, MimeType } from 'tinymce/core/html/Sanitization';

describe('browser.tinymce.core.html.SanitizationTest', () => {
  context('Sanitize html', () => {
    const testHtmlSanitizer = (testCase: { input: string; expected: string; mimeType: MimeType; sanitize?: boolean }) => {
      const sanitizer = getSanitizer({ sanitize: testCase.sanitize ?? true }, Schema());

      const body = document.createElement('body');
      body.innerHTML = testCase.input;
      sanitizer.sanitizeHtmlElement(body, testCase.mimeType);

      assert.equal(body.innerHTML, testCase.expected);
    };

    it('Sanitize iframe HTML', () => testHtmlSanitizer({
      input: '<iframe src="x"><script>alert(1)</script></iframe><iframe src="javascript:alert(1)"></iframe>',
      expected: '<iframe></iframe>',
      mimeType: 'text/html'
    }));

    it('Disabled sanitization of iframe HTML', () => testHtmlSanitizer({
      input: '<iframe src="x"><script>alert(1)</script></iframe><iframe src="javascript:alert(1)"></iframe>',
      expected: '<iframe src="x"><script>alert(1)</script></iframe><iframe></iframe>',
      mimeType: 'text/html',
      sanitize: false
    }));
  });

  context('Santitize non-html', () => {
    const testNamespaceSanitizer = (testCase: { input: string; expected: string; sanitize?: boolean; mathmlElements?: string[]; mathmlAttributes?: string[] }) => {
      const sanitizer = getSanitizer({ sanitize: testCase.sanitize ?? true, extended_mathml_elements: testCase.mathmlElements, extended_mathml_attributes: testCase.mathmlAttributes }, Schema({ custom_elements: 'math' }));

      const body = document.createElement('body');
      body.innerHTML = testCase.input;
      if (body.firstElementChild) {
        sanitizer.sanitizeNamespaceElement(body.firstElementChild);
      }

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
      expected: '<svg><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"><desc></desc></circle></svg>'
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

    context('mathml', () => {
      it('TINY-10809: Sanitize MathML', () => testNamespaceSanitizer({
        input: '<math><script>alert(1)</script><mrow><msup><mi>a</mi><mn>2</mn></msup></mrow></math>',
        expected: '<math><mrow><msup><mi>a</mi><mn>2</mn></msup></mrow></math>'
      }));

      it('TINY-10809: Disabled sanitization of MathML', () => testNamespaceSanitizer({
        input: '<math><script>alert(1)</script><mrow><msup><mi>a</mi><mn>2</mn></msup></mrow></math>',
        expected: '<math><script>alert(1)</script><mrow><msup><mi>a</mi><mn>2</mn></msup></mrow></math>',
        sanitize: false
      }));

      it('TINY-11756: No special filtering is applied', () => testNamespaceSanitizer({
        input: '<math><semantics><annotation-xml encoding="text/html">A</annotation-xml></semantics></math>',
        expected: '<math></math>',
      }));

      it('TINY-11756: Math is allowed, nothing else', () => testNamespaceSanitizer({
        input: '<math><semantics><annotation-xml encoding="text/html">A</annotation-xml></semantics></math>',
        expected: '<math></math>',
        mathmlElements: [
          'math',
        ],
      }));

      it('TINY-11756: Math and semanics is allowed, nothing else', () => testNamespaceSanitizer({
        input: '<math><semantics><annotation-xml encoding="text/html">A</annotation-xml></semantics></math>',
        expected: '<math><semantics></semantics></math>',
        mathmlElements: [
          'math',
          'semantics'
        ],
      }));

      it('TINY-11756: All the elements are allowed', () => testNamespaceSanitizer({
        input: '<math><semantics><annotation-xml encoding="text/html">A</annotation-xml></semantics></math>',
        expected: '<math><semantics><annotation-xml encoding="text/html">A</annotation-xml></semantics></math>',
        mathmlElements: [
          'math',
          'semantics',
          'annotation-xml',
          '#text'
        ],
      }));

      it('TINY-11756: Custom elements, no filtering', () => testNamespaceSanitizer({
        input: '<math display="inline"><semantics><mrow><mi>a</mi></mrow></semantics></math>',
        expected: '<math display="inline"><mrow><mi>a</mi></mrow></math>',
      }));

      it('TINY-11756: Custom elements, allow some', () => testNamespaceSanitizer({
        input: '<math display="inline"><semantics><mrow><mi>a</mi></mrow><mi>a</mi></semantics></math>',
        expected: '<math display="inline"><semantics><mrow><mi>a</mi></mrow><mi>a</mi></semantics></math>',
        mathmlElements: [
          'math',
          'semantics',
          'mi',
        ],
      }));

      it('TINY-11756: Custom elements, allow all', () => testNamespaceSanitizer({
        input: '<math display="inline"><semantics><mrow><mi>a</mi></mrow><mi>a</mi></semantics></math>',
        expected: '<math display="inline"><semantics><mrow><mi>a</mi></mrow><mi>a</mi></semantics></math>',
        mathmlElements: [
          'math',
          'semantics',
          'mi',
          '#text',
          'mrow'
        ],
      }));

      it('TINY-11756: Custom attributes, no filter', () => testNamespaceSanitizer({
        input: '<math display="inline"><semantics attribute="test" data-attribute="test"></semantics></math>',
        expected: '<math display="inline"><semantics data-attribute="test"></semantics></math>',
        mathmlElements: [
          'math',
          'semantics',
        ],
      }));

      it('TINY-11756: Custom attributes, some allowed', () => testNamespaceSanitizer({
        input: '<math display="inline"><semantics attribute="test" data-attribute="test"></semantics></math>',
        expected: '<math display="inline"><semantics data-attribute="test"></semantics></math>',
        mathmlElements: [
          'math',
          'semantics',
        ],
        mathmlAttributes: [
          'display',
        ]
      }));

      it('TINY-11756: Custom attributes, all allowed', () => testNamespaceSanitizer({
        input: '<math display="inline"><semantics attribute="test" data-attribute="test"></semantics></math>',
        expected: '<math display="inline"><semantics attribute="test" data-attribute="test"></semantics></math>',
        mathmlElements: [
          'math',
          'semantics',
        ],
        mathmlAttributes: [
          'display',
          'attribute',
        ]
      }));
    });
  });
});
