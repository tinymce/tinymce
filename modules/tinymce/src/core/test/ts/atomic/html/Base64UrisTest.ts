import { context, describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';
import { assert } from 'chai';

import { Base64Extract, parseDataUri, restoreDataUris } from 'tinymce/core/html/Base64Uris';

describe('atomic.tinymce.core.html.Base64UrisTest', () => {
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
    KAssert.eqOptional('Corrupted data', Optional.some({ type: 'image/gif', data: 'R0' }), parseDataUri('data:image/gif;base64,R0ÖlGODdhIAAgAIABAP8AAP///ywAAAAAIAAgAAACHoSPqcvtD6OctNqLs968+w+G4kiW5omm6sq27gubBQA7AA==%A0'));
    KAssert.eqOptional(
      'Corrupted data due to added URL encoded nbsp',
      Optional.some({
        type: 'image/gif',
        data: 'R0lGODdhIAAgAIABAP8AAP///ywAAAAAIAAgAAACHoSPqcvtD6OctNqLs968+w+G4kiW5omm6sq27gubBQA7AA=='
      }),
      parseDataUri('data:image/gif;base64,R0lGODdhIAAgAIABAP8AAP///ywAAAAAIAAgAAACHoSPqcvtD6OctNqLs968+w+G4kiW5omm6sq27gubBQA7AA==%A0'));
  });
});
