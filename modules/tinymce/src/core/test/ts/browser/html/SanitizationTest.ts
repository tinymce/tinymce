import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import Schema from 'tinymce/core/api/html/Schema';
import { getSanitizer, MimeType } from 'tinymce/core/html/Sanitization';

describe('browser.tinymce.core.html.SanitizationTest', () => {
  const testHtmlSanitizer = (testCase: { input: string; expected: string; mimeType: MimeType }) => {
    const sanitizer = getSanitizer({}, Schema());

    const body = document.createElement('body');
    body.innerHTML = testCase.input;
    sanitizer(body, testCase.mimeType);

    assert.equal(body.innerHTML, testCase.expected);
  };

  it('Sanitize iframe url', () => testHtmlSanitizer({
    input: '<iframe src="javascript:alert(1)"></iframe>',
    expected: '<iframe></iframe>',
    mimeType: 'text/html'
  }));
});
