import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';

import { parseDataUri } from 'tinymce/core/file/Conversions';

describe('atomic.tinymce.core.file.ConversionsTest', () => {
  it('parseDataUri', () => {
    KAssert.eqOptional('Plain text mime', Optional.some({ type: 'image/png', data: 'R0/yw==', base64Encoded: true }), parseDataUri('data:image/png;base64,R0/yw=='));
    KAssert.eqOptional('Mime with dash', Optional.some({ type: 'image/x-icon', data: 'R1/yw==', base64Encoded: true }), parseDataUri('data:image/x-icon;base64,R1/yw=='));
    KAssert.eqOptional('Mime with plus', Optional.some({ type: 'image/svg+xml', data: 'R2/yw==', base64Encoded: true }), parseDataUri('data:image/svg+xml;base64,R2/yw=='));
    KAssert.eqOptional('URI encoded value', Optional.some({ type: 'image/svg+xml', data: '<svg></svg>', base64Encoded: false }), parseDataUri('data:image/svg+xml,%3Csvg%3E%3C/svg%3E'));
    KAssert.eqOptional('Data uri without mime', Optional.none(), parseDataUri('data:base64,R3/yw=='));
    KAssert.eqOptional('Blob uri', Optional.none(), parseDataUri('blob:70BE8432-BA4D-4787-9AB9-86563351FBF7'));
    KAssert.eqOptional(
      'Data with spaces, tabs and line breaks',
      Optional.some({ type: 'image/png', data: 'SGVsbG8sI\r\n  Hdv		cmxkIQ==', base64Encoded: true }),
      parseDataUri('data:image/png;base64,SGVsbG8sI\r\n  Hdv		cmxkIQ==')
    );
    KAssert.eqOptional(
      'Corrupted base64 data',
      Optional.some({ type: 'image/gif', data: 'R0', base64Encoded: true }),
      parseDataUri('data:image/gif;base64,R0ÖlGODdhIAAgAIABAP8AAP///ywAAAAAIAAgAAACHoSPqcvtD6OctNqLs968+w+G4kiW5omm6sq27gubBQA7AA==%A0')
    );
    KAssert.eqOptional(
      'Corrupted data due to added URL encoded nbsp',
      Optional.some({
        type: 'image/gif',
        data: 'R0lGODdhIAAgAIABAP8AAP///ywAAAAAIAAgAAACHoSPqcvtD6OctNqLs968+w+G4kiW5omm6sq27gubBQA7AA==',
        base64Encoded: true
      }),
      parseDataUri('data:image/gif;base64,R0lGODdhIAAgAIABAP8AAP///ywAAAAAIAAgAAACHoSPqcvtD6OctNqLs968+w+G4kiW5omm6sq27gubBQA7AA==%A0'));
  });
});
