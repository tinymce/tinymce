import { Assert, UnitTest } from '@ephox/bedrock-client';
import { extractBase64DataUris, Base64Extract, restoreDataUris, UriMap, parseDataUri } from 'tinymce/core/html/Base64Uris';
import { Logger } from '@ephox/agar';
import { Obj, Option } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';

UnitTest.test('Base64Uris Test', () => {
  const replacePrefix = (value: string, prefix: string) => value.replace(/\$prefix/g, prefix);
  const replaceUrisPrefix = (uris: UriMap, prefix: string): UriMap => Obj.tupleMap(uris, (value, key) => ({ k: replacePrefix(key, prefix), v: value }));

  const testExtract = (label: string, html: string, expectedExtract: Partial<Base64Extract>) => {
    Logger.sync(label, () => {
      const actualExtract = extractBase64DataUris(html);
      const expectedHtml = replacePrefix(expectedExtract.html, actualExtract.prefix);
      const expectedUris = replaceUrisPrefix(expectedExtract.uris, actualExtract.prefix);

      Assert.eq('Should be expected html', expectedHtml, actualExtract.html);
      Assert.eq('Should have expected uris', expectedUris, actualExtract.uris);
    });
  };

  Logger.sync('extractBase64DataUris', () => {
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
          $prefix_0: 'data:image/gif;base64,R0/yw==',
        }
      }
    );

    testExtract(
      'Should extract one base64 encoded image from html with text before/after the image',
      'a<img src="data:image/gif;base64,R0/yw==">b',
      {
        html: 'a<img src="$prefix_0">b',
        uris: {
          $prefix_0: 'data:image/gif;base64,R0/yw==',
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
          $prefix_1: 'data:image/x-icon;base64,R1/yw==',
        }
      }
    );

    testExtract(
      'Should extract base64 encoded thing with random mime type',
      '<img src="data:some/thing;base64,R2/yw==">',
      {
        html: '<img src="$prefix_0">',
        uris: {
          $prefix_0: 'data:some/thing;base64,R2/yw==',
        }
      }
    );
  });

  const testRestoreDataUris = (label: string, inputResult: Base64Extract, inputHtml: string, expectedHtml: string) => {
    Logger.sync(label, () => {
      const actualHtml = restoreDataUris(inputHtml, inputResult);

      Assert.eq('Should be the extected html', expectedHtml, actualHtml);
    });
  };

  Logger.sync('restoreDataUris', () => {
    testRestoreDataUris(
      'Should restore image uris to base64 uris',
      {
        prefix: 'img_123',
        html: '<img src="img_123_0"><img src="img_123_1"><img src="img_123_2">',
        uris: {
          img_123_0: 'data:image/gif;base64,R0/yw==',
          img_123_1: 'data:image/png;base64,R1/yw==',
          img_123_2: 'data:image/jpeg;base64,R2/yw=='
        }
      },
      '<img src="img_123_0"><img src="img_123_1"><img src="img_123_2">',
      '<img src="data:image/gif;base64,R0/yw=="><img src="data:image/png;base64,R1/yw=="><img src="data:image/jpeg;base64,R2/yw==">'
    );
  });

  Logger.sync('parseDataUri', () => {
    KAssert.eqOption('Plain text mime', Option.some({ type: 'image/png', data: 'R0/yw==' }), parseDataUri('data:image/png;base64,R0/yw=='));
    KAssert.eqOption('Mime with dash', Option.some({ type: 'image/x-icon', data: 'R1/yw==' }), parseDataUri('data:image/x-icon;base64,R1/yw=='));
    KAssert.eqOption('Mime with plus', Option.some({ type: 'image/svg+xml', data: 'R2/yw==' }), parseDataUri('data:image/svg+xml;base64,R2/yw=='));
    KAssert.eqOption('Data uri without mime', Option.none(), parseDataUri('data:base64,R3/yw=='));
    KAssert.eqOption('Data uri without base64', Option.none(), parseDataUri('data:image/svg+xml,R4/yw=='));
  });
});
