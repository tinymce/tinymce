import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import { UploadStatus } from 'tinymce/core/file/UploadStatus';

describe('browser.tinymce.core.file.UploadStatusTest', () => {
  it('hasBlobUri/markPending', () => {
    const status = UploadStatus();

    assert.isFalse(status.hasBlobUri('nonexisting_uri'));
    status.markPending('existing_uri');
    assert.isTrue(status.isPending('existing_uri'));
    assert.isFalse(status.isUploaded('existing_uri'));
    assert.isTrue(status.hasBlobUri('existing_uri'));

    status.markUploaded('existing_uri', 'uri');
    assert.isFalse(status.isPending('existing_uri'));
    assert.isTrue(status.isUploaded('existing_uri'));
    assert.isTrue(status.hasBlobUri('existing_uri'));
    assert.strictEqual(status.getResultUri('existing_uri'), 'uri');

    status.markUploaded('existing_uri2', 'uri2');
    assert.isFalse(status.isPending('existing_uri'));
    assert.isTrue(status.isUploaded('existing_uri'));
    assert.isTrue(status.hasBlobUri('existing_uri2'));
    assert.strictEqual(status.getResultUri('existing_uri2'), 'uri2');

    status.markPending('existing_uri');
    assert.isTrue(status.hasBlobUri('existing_uri'));
    status.removeFailed('existing_uri');
    assert.isFalse(status.hasBlobUri('existing_uri'));
  });
});
