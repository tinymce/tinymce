import { Assertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { BlobCache, BlobInfoData } from 'tinymce/core/api/file/BlobCache';

UnitTest.test('browser.tinymce.core.file.BlobCacheTest', function () {
  const uriToBlob = function (base64: string, type: string) {
    let i;
    const str = atob(base64);
    const arr = new Uint8Array(str.length);

    for (i = 0; i < arr.length; i++) {
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

  const blobCache = BlobCache();

  const blobInfo1 = blobCache.create(id, blob, base64, name);
  Assertions.assertEq('Testing original version of create() method',
    [ id, base64, filename ],
    [ blobInfo1.id(), blobInfo1.base64(), blobInfo1.filename() ]
  );

  blobCache.add(blobInfo1);

  Assertions.assertEq('Testing get()', blobInfo1, blobCache.get(id));
  Assertions.assertEq('BlobInfo instance has blobUri() accessor', true, blobInfo1.blobUri().indexOf('blob:') === 0);
  Assertions.assertEq('Testing getByUri(), findFirst()', blobInfo1, blobCache.getByUri(blobInfo1.blobUri()));
  Assertions.assertEq('Testing getByData()', blobInfo1, blobCache.getByData(base64, type));

  blobCache.removeByUri(blobInfo1.blobUri());
  Assertions.assertEq('Testing removeByUri()', undefined, blobCache.getByUri(blobInfo1.blobUri()));

  try {
    blobCache.create({ blob } as BlobInfoData);
    Assertions.assertEq('Exception should be thrown if BlobInfo is created without blob or base64 entries', false, true);
  } catch (ex) {
    Assertions.assertEq('Exception should be thrown if BlobInfo is created without blob or base64 entries', true, true);
  }

  const blobInfo2 = blobCache.create({
    id,
    blob,
    base64,
    name,
    uri
  });

  Assertions.assertEq('Testing if create() method accepts object',
    [ id, base64, filename, uri ],
    [ blobInfo2.id(), blobInfo2.base64(), blobInfo2.filename(), blobInfo2.uri() ]
  );

  const blobInfo3 = blobCache.create(id, blob, base64, name, specifiedFilename);

  Assertions.assertEq('Testing original version of create() method with specified filename',
    [ id, base64, name, specifiedFilename ],
    [ blobInfo3.id(), blobInfo3.base64(), blobInfo3.name(), blobInfo3.filename() ]
  );

  const blobInfo4 = blobCache.create({
    id,
    blob,
    base64,
    name,
    uri,
    filename: specifiedFilename
  });

  Assertions.assertEq('Testing if create() method with specified filename',
    [ id, base64, specifiedFilename, uri ],
    [ blobInfo4.id(), blobInfo4.base64(), blobInfo4.filename(), blobInfo4.uri() ]
  );
});
