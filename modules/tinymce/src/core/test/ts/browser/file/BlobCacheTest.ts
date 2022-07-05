import { before, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import { BlobCache, BlobInfoData } from 'tinymce/core/api/file/BlobCache';

describe('browser.tinymce.core.file.BlobCacheTest', () => {
  const uriToBlob = (base64: string, type: string) => {
    const str = atob(base64);
    const arr = new Uint8Array(str.length);

    for (let i = 0; i < arr.length; i++) {
      arr[i] = str.charCodeAt(i);
    }
    return new Blob([ arr ], { type });
  };

  const id = 'blob0';
  const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; // 1x1 transparent png
  const type = 'image/png';
  const blob = uriToBlob(base64, type);
  const name = 'blank';
  const filename = 'blank.png';
  const specifiedFilename = 'blank.jfif';
  const uri = 'http://localhost/blank.png';

  let blobCache: BlobCache;

  before(() => {
    blobCache = BlobCache();
  });

  it('create original version', () => {
    const blobInfo = blobCache.create(id, blob, base64, name);
    assert.deepEqual(
      [ blobInfo.id(), blobInfo.base64(), blobInfo.filename() ],
      [ id, base64, filename ],
      'Testing original version of create() method'
    );

    blobCache.add(blobInfo);

    assert.deepEqual(blobCache.get(id), blobInfo, 'Testing get()');
    assert.isTrue(blobInfo.blobUri().indexOf('blob:') === 0, 'BlobInfo instance has blobUri() accessor');
    assert.deepEqual(blobCache.getByUri(blobInfo.blobUri()), blobInfo, 'Testing getByUri(), findFirst()');
    assert.deepEqual(blobCache.getByData(base64, type), blobInfo, 'Testing getByData()');

    blobCache.removeByUri(blobInfo.blobUri());
    assert.isUndefined(blobCache.getByUri(blobInfo.blobUri()), 'Testing removeByUri()');

    assert.throws(() => {
      blobCache.create({ blob } as BlobInfoData);
      assert.fail('Exception should be thrown if BlobInfo is created without blob or base64 entries');
    }, /.*/, 'Exception should be thrown if BlobInfo is created without blob or base64 entries');
  });

  it('create with object', () => {
    const blobInfo = blobCache.create({
      id,
      blob,
      base64,
      name,
      uri
    });

    assert.deepEqual(
      [ blobInfo.id(), blobInfo.base64(), blobInfo.filename(), blobInfo.uri() ],
      [ id, base64, filename, uri ],
      'Testing if create() method accepts object'
    );
  });

  it('create original version with filename', () => {
    const blobInfo = blobCache.create(id, blob, base64, name, specifiedFilename);

    assert.deepEqual(
      [ blobInfo.id(), blobInfo.base64(), blobInfo.name(), blobInfo.filename() ],
      [ id, base64, name, specifiedFilename ],
      'Testing original version of create() method with specified filename'
    );
  });

  it('create with object containing filename', () => {
    const blobInfo = blobCache.create({
      id,
      blob,
      base64,
      name,
      uri,
      filename: specifiedFilename
    });

    assert.deepEqual(
      [ blobInfo.id(), blobInfo.base64(), blobInfo.filename(), blobInfo.uri() ],
      [ id, base64, specifiedFilename, uri ],
      'Testing create() method with specified filename'
    );
  });
});
