import { before, describe, it } from '@ephox/bedrock-client';
import { LegacyUnit } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Env from 'tinymce/core/api/Env';
import { BlobCache } from 'tinymce/core/api/file/BlobCache';
import * as Conversions from 'tinymce/core/file/Conversions';
import { ImageScanner } from 'tinymce/core/file/ImageScanner';
import { UploadStatus } from 'tinymce/core/file/UploadStatus';

import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.file.ImageScannerTest', () => {
  const viewBlock = ViewBlock.bddSetup();
  const base64Src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAAAAACH5BAAAAAAALAAAAAABAAEAAAICTAEAOw==';
  const invalidBlobUriSrc = 'blob:70BE8432-BA4D-4787-9AB9-86563351FBF7';
  let blobUriSrc;

  before(function () {
    if (!Env.fileApi) {
      // eslint-disable-next-line no-console
      console.log('File API not supported by browser.');
      this.skip();
    }

    return Conversions.uriToBlob(base64Src).then((blob) => {
      blobUriSrc = URL.createObjectURL(blob);
    });
  });

  it('findAll', () => {
    const imageScanner = ImageScanner(UploadStatus(), BlobCache());

    viewBlock.update(
      '<img src="' + base64Src + '">' +
      '<img src="' + blobUriSrc + '">' +
      '<img src="' + Env.transparentSrc + '">' +
      '<img src="' + base64Src + '" data-mce-bogus="1">' +
      '<img src="' + base64Src + '" data-mce-placeholder="1">' +
      '<img src="' + invalidBlobUriSrc + '">'
    );

    return imageScanner.findAll(viewBlock.get()).then((result) => {
      const blobInfo = result[0].blobInfo;
      assert.lengthOf(result, 3);
      assert.typeOf(result[result.length - 1], 'string', 'Last item is not the image, but error message.');
      assert.equal('data:image/gif;base64,' + blobInfo.base64(), base64Src);
      LegacyUnit.equalDom(result[0].image, viewBlock.get().firstChild);
    });
  });

  it('findAll (filtered)', () => {
    const imageScanner = ImageScanner(UploadStatus(), BlobCache());

    const predicate = (img: HTMLImageElement) => {
      return !img.hasAttribute('data-skip');
    };

    viewBlock.update(
      '<img src="' + base64Src + '">' +
      '<img src="' + base64Src + '" data-skip="1">'
    );

    return imageScanner.findAll(viewBlock.get(), predicate).then((result) => {
      assert.lengthOf(result, 1);
      assert.equal('data:image/gif;base64,' + result[0].blobInfo.base64(), base64Src);
      LegacyUnit.equalDom(result[0].image, viewBlock.get().firstChild);
    });
  });
});
