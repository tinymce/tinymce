test(
  'browser.tinymce.core.file.BlobCacheTest',
  [
    'ephox.agar.api.Assertions',
    'tinymce.core.file.Conversions',
    'tinymce.core.file.BlobCache',
    'global!Uint8Array',
    'global!Blob',
    'global!URL'
  ],
  function (Assertions, Conversions, BlobCache, Uint8Array, Blob, URL) {
    var uriToBlob = function (base64, type) {
      var i, str = atob(base64);
      var arr = new Uint8Array(str.length);

      for (i = 0; i < arr.length; i++) {
        arr[i] = str.charCodeAt(i);
      }
      return new Blob([arr], { type: type });
    };

    var id = 'blob0';
    var base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; // 1x1 transparent png
    var blob = uriToBlob(base64, 'image/png');
    var name = 'blank';
    var filename = 'blank.png';
    var uri = 'http://localhost/blank.png';

    var blobInfo, blobCache = new BlobCache();

    blobInfo = blobCache.create(id, blob, base64, name);
    Assertions.assertEq("Testing original version of create() method",
      [ id, base64, filename ],
      [ blobInfo.id(), blobInfo.base64(), blobInfo.filename() ]
    );

    blobCache.add(blobInfo);

    Assertions.assertEq("Testing get()", blobInfo, blobCache.get(id));
    Assertions.assertEq("BlobInfo instance has blobUri() accessor", true, blobInfo.blobUri().indexOf('blob:') === 0);
    Assertions.assertEq("Testing getByUri(), findFirst()", blobInfo, blobCache.getByUri(blobInfo.blobUri()));

    blobCache.removeByUri(blobInfo.blobUri());
    Assertions.assertEq("Testing removeByUri()", undefined, blobCache.getByUri(blobInfo.blobUri()));

    try {
      blobInfo = blobCache.create({ blob: blob });
      Assertions.assertEq("Exception should be thrown if BlobInfo is created without blob or base64 entries", false, true);
    } catch (ex) {
      Assertions.assertEq("Exception should be thrown if BlobInfo is created without blob or base64 entries", true, true);
    }

    blobInfo = blobCache.create({
      id: id,
      blob: blob,
      base64: base64,
      name: name,
      uri: uri
    });

    Assertions.assertEq("Testing if create() method accepts object",
      [ id, base64, filename, uri ],
      [ blobInfo.id(), blobInfo.base64(), blobInfo.filename(), blobInfo.uri() ]
    );
  }
);