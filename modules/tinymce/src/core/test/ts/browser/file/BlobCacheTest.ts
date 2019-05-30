import { Assertions } from '@ephox/agar';
import { Blob, Uint8Array, Window } from '@ephox/sand';
import { BlobCache, BlobInfoData } from 'tinymce/core/api/file/BlobCache';
import { UnitTest } from '@ephox/bedrock';

UnitTest.test('browser.tinymce.core.file.BlobCacheTest', function () {
  const uriToBlob = function (base64, type) {
    let i;
    const str = Window.atob(base64);
    const arr = Uint8Array(str.length);

    for (i = 0; i < arr.length; i++) {
      arr[i] = str.charCodeAt(i);
    }
    return Blob([arr], { type });
  };

  const id = 'blob0';
  const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; // 1x1 transparent png
  const blob = uriToBlob(base64, 'image/png');
  const name = 'blank';
  const filename = 'blank.png';
  const uri = 'http://localhost/blank.png';

  let blobInfo;
  const blobCache = BlobCache();

  blobInfo = blobCache.create(id, blob, base64, name);
  Assertions.assertEq('Testing original version of create() method',
    [ id, base64, filename ],
    [ blobInfo.id(), blobInfo.base64(), blobInfo.filename() ]
  );

  blobCache.add(blobInfo);

  Assertions.assertEq('Testing get()', blobInfo, blobCache.get(id));
  Assertions.assertEq('BlobInfo instance has blobUri() accessor', true, blobInfo.blobUri().indexOf('blob:') === 0);
  Assertions.assertEq('Testing getByUri(), findFirst()', blobInfo, blobCache.getByUri(blobInfo.blobUri()));

  blobCache.removeByUri(blobInfo.blobUri());
  Assertions.assertEq('Testing removeByUri()', undefined, blobCache.getByUri(blobInfo.blobUri()));

  try {
    blobInfo = blobCache.create({ blob } as BlobInfoData);
    Assertions.assertEq('Exception should be thrown if BlobInfo is created without blob or base64 entries', false, true);
  } catch (ex) {
    Assertions.assertEq('Exception should be thrown if BlobInfo is created without blob or base64 entries', true, true);
  }

  blobInfo = blobCache.create({
    id,
    blob,
    base64,
    name,
    uri
  });

  Assertions.assertEq('Testing if create() method accepts object',
    [ id, base64, filename, uri ],
    [ blobInfo.id(), blobInfo.base64(), blobInfo.filename(), blobInfo.uri() ]
  );
});
