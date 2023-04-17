import { before, describe, it } from '@ephox/bedrock-client';
import { LegacyUnit } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Env from 'tinymce/core/api/Env';
import { BlobCache } from 'tinymce/core/api/file/BlobCache';
import * as Conversions from 'tinymce/core/file/Conversions';
import { BlobInfoImagePair, ImageScanner } from 'tinymce/core/file/ImageScanner';
import { UploadStatus } from 'tinymce/core/file/UploadStatus';

import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.file.ImageScannerTest', () => {
  const viewBlock = ViewBlock.bddSetup();
  const base64Src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAAAAACH5BAAAAAAALAAAAAABAAEAAAICTAEAOw==';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" height="100" width="100"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"></svg>`;
  const encodedSrc = 'data:image/svg+xml,' + encodeURIComponent(svg);
  const invalidBlobUriSrc = 'blob:70BE8432-BA4D-4787-9AB9-86563351FBF7';
  let blobUriSrc: string | undefined;

  before(() => {
    return Conversions.uriToBlob(base64Src).then((blob) => {
      blobUriSrc = URL.createObjectURL(blob);
    });
  });

  it('findAll', () => {
    const imageScanner = ImageScanner(UploadStatus(), BlobCache());

    viewBlock.update(
      '<img src="' + base64Src + '">' +
      '<img src="' + blobUriSrc + '">' +
      '<img src="' + encodedSrc + '">' +
      '<img src="' + Env.transparentSrc + '">' +
      '<img src="' + base64Src + '" data-mce-bogus="1">' +
      '<img src="' + base64Src + '" data-mce-placeholder="1">' +
      '<img src="' + invalidBlobUriSrc + '">'
    );

    return imageScanner.findAll(viewBlock.get()).then((result) => {
      assert.lengthOf(result, 4);
      const base64ImageResult = result[0] as BlobInfoImagePair;
      const encodedImageResult = result[2] as BlobInfoImagePair;
      assert.typeOf(result[result.length - 1], 'object', 'Last item is not the image, but error object.');
      assert.equal('data:image/gif;base64,' + base64ImageResult.blobInfo.base64(), base64Src);
      LegacyUnit.equalDom(base64ImageResult.image, viewBlock.get().firstChild as HTMLImageElement);
      assert.equal('data:image/svg+xml;base64,' + encodedImageResult.blobInfo.base64(), 'data:image/svg+xml;base64,' + btoa(svg));
      LegacyUnit.equalDom(encodedImageResult.image, viewBlock.get().childNodes.item(2));
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
      const firstResult = result[0] as BlobInfoImagePair;
      assert.equal('data:image/gif;base64,' + firstResult.blobInfo.base64(), base64Src);
      LegacyUnit.equalDom(firstResult.image, viewBlock.get().firstChild as HTMLImageElement);
    });
  });
});
