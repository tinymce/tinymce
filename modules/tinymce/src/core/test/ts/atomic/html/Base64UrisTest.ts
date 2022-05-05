import { context, describe, it } from '@ephox/bedrock-client';
import { Obj, Optional } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';
import { assert } from 'chai';

import { Base64Extract, extractBase64DataUris, parseDataUri, restoreDataUris, UriMap } from 'tinymce/core/html/Base64Uris';

describe('atomic.tinymce.core.html.Base64UrisTest', () => {
  const replacePrefix = (value: string, prefix: string) => value.replace(/\$prefix/g, prefix);
  const replaceUrisPrefix = (uris: UriMap, prefix: string): UriMap => Obj.tupleMap(uris, (value, key) => ({ k: replacePrefix(key, prefix), v: value }));

  const testExtract = (label: string, html: string, expectedExtract: Partial<Base64Extract>) => {
    it(label, () => {
      const actualExtract = extractBase64DataUris(html);
      const expectedHtml = replacePrefix(expectedExtract.html, actualExtract.prefix);
      const expectedUris = replaceUrisPrefix(expectedExtract.uris, actualExtract.prefix);

      assert.equal(actualExtract.html, expectedHtml, 'Should be expected html');
      assert.deepEqual(actualExtract.uris, expectedUris, 'Should have expected uris');
    });
  };

  context('extractBase64DataUris', () => {
    testExtract(
      'Should not touch images that is not base64 data uris',
      '<img src="my.gif"><img src="blob:https://localhost">',
      {
        html: '<img src="my.gif"><img src="blob:https://localhost">',
        uris: {}
      }
    );

    testExtract(
      'Should extract one base64 encoded image from html with just a image',
      '<img src="data:image/gif;base64,R0/yw==">',
      {
        html: '<img src="$prefix_0">',
        uris: {
          $prefix_0: 'data:image/gif;base64,R0/yw=='
        }
      }
    );

    testExtract(
      'Should extract one base64 encoded image from html with text before/after the image',
      'a<img src="data:image/gif;base64,R0/yw==">b',
      {
        html: 'a<img src="$prefix_0">b',
        uris: {
          $prefix_0: 'data:image/gif;base64,R0/yw=='
        }
      }
    );

    testExtract(
      'Should extract three base64 encoded images with different mimes from html',
      '<img src="data:image/gif;base64,R0/yw=="><img src="data:image/png;base64,R1/yw=="><img src="data:image/jpeg;base64,R2/yw==">',
      {
        html: '<img src="$prefix_0"><img src="$prefix_1"><img src="$prefix_2">',
        uris: {
          $prefix_0: 'data:image/gif;base64,R0/yw==',
          $prefix_1: 'data:image/png;base64,R1/yw==',
          $prefix_2: 'data:image/jpeg;base64,R2/yw=='
        }
      }
    );

    testExtract(
      'Should extract base64 encoded images with mimes that has special characters',
      '<img src="data:image/svg+xml;base64,R0/yw=="><img src="data:image/x-icon;base64,R1/yw==">',
      {
        html: '<img src="$prefix_0"><img src="$prefix_1">',
        uris: {
          $prefix_0: 'data:image/svg+xml;base64,R0/yw==',
          $prefix_1: 'data:image/x-icon;base64,R1/yw=='
        }
      }
    );

    testExtract(
      'Should extract base64 encoded thing with random mime type',
      '<img src="data:some/thing;base64,R2/yw==">',
      {
        html: '<img src="$prefix_0">',
        uris: {
          $prefix_0: 'data:some/thing;base64,R2/yw=='
        }
      }
    );

    testExtract(
      'Should extract base64 encoded thing with spaces, tabs and line breaks in data',
      '<img src="data:some/thing;base64,SGVsbG8sI\r\n  Hdv		cmxkIQ==">',
      {
        html: '<img src="$prefix_0">',
        uris: {
          $prefix_0: 'data:some/thing;base64,SGVsbG8sI\r\n  Hdv		cmxkIQ=='
        }
      }
    );

    testExtract(
      'TINY-8646: Should extract base64 encoded image following `data:` text on the same paragaph',
      '<p>my data:<img src="data:image/gif;base64,R0/yw=="/></p>',
      {
        html: '<p>my data:<img src="$prefix_0"/></p>',
        uris: {
          $prefix_0: 'data:image/gif;base64,R0/yw=='
        }
      }
    );

    testExtract(
      'TINY-8646: Should extract base64 encoded image in the next paragraph following `data:` text',
      '<p>my data:</p><p><img src="data:image/gif;base64,R0/yw=="/></p>',
      {
        html: '<p>my data:</p><p><img src="$prefix_0"/></p>',
        uris: {
          $prefix_0: 'data:image/gif;base64,R0/yw=='
        }
      }
    );

    testExtract(
      'TINY-8646: Should extract based64 encoded image following an attribute with `data:` text as a value',
      '<img name="data:" src="data:image/gif;base64,R0/yw=="/>',
      {
        html: '<img name="data:" src="$prefix_0"/>',
        uris: {
          $prefix_0: 'data:image/gif;base64,R0/yw=='
        }
      }
    );

    testExtract(
      'TINY-8646: Should extract based64 encoded image when there is no space between attributes',
      '<img name="data:"src="data:image/gif;base64,R0/yw=="/>',
      {
        html: '<img name="data:"src="$prefix_0"/>',
        uris: {
          $prefix_0: 'data:image/gif;base64,R0/yw=='
        }
      }
    );

    testExtract(
      'TINY-8646: Should extract based64 encoded image when single quotes are used',
      `<img name='data:'src='data:image/gif;base64,R0/yw=='/>`,
      {
        html: `<img name='data:'src='$prefix_0'/>`,
        uris: {
          $prefix_0: 'data:image/gif;base64,R0/yw=='
        }
      }
    );

    testExtract(
      'TINY-8646: Should extract based64 encoded image when whitespaces are used (eg newline, tabs)',
      '<img name="data:"\n' + 'src="data:image/gif;base64,R0/yw=="/>',
      {
        html: '<img name="data:"\n' + 'src="$prefix_0"/>',
        uris: {
          $prefix_0: 'data:image/gif;base64,R0/yw=='
        }
      }
    );
  });

  const testRestoreDataUris = (label: string, inputResult: Base64Extract, inputHtml: string, expectedHtml: string) => {
    it(label, () => {
      const actualHtml = restoreDataUris(inputHtml, inputResult);

      assert.equal(actualHtml, expectedHtml, 'Should be the expected html');
    });
  };

  context('restoreDataUris', () => {
    testRestoreDataUris(
      'Should restore image uris to base64 uris',
      {
        prefix: 'img_123',
        html: '<img src="img_123_0"><img src="img_123_1"><img src="img_123_2">',
        uris: {
          img_123_0: 'data:image/gif;base64,R0/yw==',
          img_123_1: 'data:image/png;base64,R1/yw==',
          img_123_2: 'data:image/jpeg;base64,R2/yw=='
        },
        re: /img_123_[0-9]+/g
      },
      '<img src="img_123_0"><img src="img_123_1"><img src="img_123_2">',
      '<img src="data:image/gif;base64,R0/yw=="><img src="data:image/png;base64,R1/yw=="><img src="data:image/jpeg;base64,R2/yw==">'
    );
  });

  it('parseDataUri', () => {
    KAssert.eqOptional('Plain text mime', Optional.some({ type: 'image/png', data: 'R0/yw==' }), parseDataUri('data:image/png;base64,R0/yw=='));
    KAssert.eqOptional('Mime with dash', Optional.some({ type: 'image/x-icon', data: 'R1/yw==' }), parseDataUri('data:image/x-icon;base64,R1/yw=='));
    KAssert.eqOptional('Mime with plus', Optional.some({ type: 'image/svg+xml', data: 'R2/yw==' }), parseDataUri('data:image/svg+xml;base64,R2/yw=='));
    KAssert.eqOptional('Data uri without mime', Optional.none(), parseDataUri('data:base64,R3/yw=='));
    KAssert.eqOptional('Data uri without base64', Optional.none(), parseDataUri('data:image/svg+xml,R4/yw=='));
    KAssert.eqOptional('Data with spaces, tabs and line breaks', Optional.some({ type: 'image/png', data: 'SGVsbG8sI\r\n  Hdv		cmxkIQ==' }), parseDataUri('data:image/png;base64,SGVsbG8sI\r\n  Hdv		cmxkIQ=='));
  });
});
