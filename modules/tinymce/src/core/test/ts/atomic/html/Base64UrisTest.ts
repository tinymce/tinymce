import { Assert, UnitTest } from '@ephox/bedrock-client';
import { extractBase64DataUris, Base64Extract, buildBase64DataUri, restoreDataUris, Base64UriMatch } from 'tinymce/core/html/Base64Uris';
import { Obj } from '@ephox/katamari';
import { Logger } from '@ephox/agar';

UnitTest.test('Base64Uris Test', () => {
  const replacePrefix = (value: string, prefix: string) => value.replace(/\$prefix/g, prefix);
  const replaceUrisPrefix = (uris: Record<string, Base64UriMatch>, prefix: string): Record<string, Base64UriMatch> => {
    return Obj.tupleMap(uris, (value, key) => ({k: replacePrefix(key, prefix), v: value}));
  };

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
          $prefix_0: {
            mime: 'image/gif',
            base64: 'R0/yw=='
          }
        }
      }
    );

    testExtract(
      'Should extract one base64 encoded image from html with text before/after the image',
      'a<img src="data:image/gif;base64,R0/yw==">b',
      {
        html: 'a<img src="$prefix_0">b',
        uris: {
          $prefix_0: {
            mime: 'image/gif',
            base64: 'R0/yw=='
          }
        }
      }
    );

    testExtract(
      'Should extract three base64 encoded images with different mimes from html',
      '<img src="data:image/gif;base64,R0/yw=="><img src="data:image/png;base64,R1/yw=="><img src="data:image/jpeg;base64,R2/yw==">',
      {
        html: '<img src="$prefix_0"><img src="$prefix_1"><img src="$prefix_2">',
        uris: {
          $prefix_0: {
            mime: 'image/gif',
            base64: 'R0/yw=='
          },
          $prefix_1: {
            mime: 'image/png',
            base64: 'R1/yw=='
          },
          $prefix_2: {
            mime: 'image/jpeg',
            base64: 'R2/yw=='
          }
        }
      }
    );
  });

  Logger.sync('buildBase64DataUri', () => {
    Assert.eq('Should be a gif base64 image', 'data:image/gif;base64,R0/yw==', buildBase64DataUri({
      mime: 'image/gif',
      base64: 'R0/yw=='
    }));

    Assert.eq('Should be a png base64 image', 'data:image/png;base64,R1/yw==', buildBase64DataUri({
      mime: 'image/png',
      base64: 'R1/yw=='
    }));

    Assert.eq('Should be a jpeg base64 image', 'data:image/jpeg;base64,R2/yw==', buildBase64DataUri({
      mime: 'image/jpeg',
      base64: 'R2/yw=='
    }));
  });

  const testRestoreDataUris = (label, inputResult, inputHtml, expectedHtml) => {
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
          img_123_0: {
            mime: 'image/gif',
            base64: 'R0/yw=='
          },
          img_123_1: {
            mime: 'image/png',
            base64: 'R1/yw=='
          },
          img_123_2: {
            mime: 'image/jpeg',
            base64: 'R2/yw=='
          }
        }
      },
      '<img src="img_123_0"><img src="img_123_1"><img src="img_123_2">',
      '<img src="data:image/gif;base64,R0/yw=="><img src="data:image/png;base64,R1/yw=="><img src="data:image/jpeg;base64,R2/yw==">'
    );
  });
});
