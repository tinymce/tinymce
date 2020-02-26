import { Pipeline } from '@ephox/agar';
import { LegacyUnit } from '@ephox/mcagar';
import Env from 'tinymce/core/api/Env';
import { BlobCache } from 'tinymce/core/api/file/BlobCache';
import * as Conversions from 'tinymce/core/file/Conversions';
import { ImageScanner } from 'tinymce/core/file/ImageScanner';
import UploadStatus from 'tinymce/core/file/UploadStatus';
import ViewBlock from '../../module/test/ViewBlock';
import { UnitTest } from '@ephox/bedrock-client';
import { URL } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.core.file.ImageScannerTest', function (success, failure) {
  const suite = LegacyUnit.createSuite();
  const viewBlock = ViewBlock();

  if (!Env.fileApi) {
    return;
  }

  const base64Src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAAAAACH5BAAAAAAALAAAAAABAAEAAAICTAEAOw==';
  let blobUriSrc;
  const invalidBlobUriSrc = 'blob:70BE8432-BA4D-4787-9AB9-86563351FBF7';

  Conversions.uriToBlob(base64Src).then(function (blob) {
    blobUriSrc = URL.createObjectURL(blob);
  });

  suite.asyncTest('findAll', function (_, done) {
    const imageScanner = ImageScanner(UploadStatus(), BlobCache());

    viewBlock.update(
      '<img src="' + base64Src + '">' +
      '<img src="' + blobUriSrc + '">' +
      '<img src="' + Env.transparentSrc + '">' +
      '<img src="' + base64Src + '" data-mce-bogus="1">' +
      '<img src="' + base64Src + '" data-mce-placeholder="1">' +
      '<img src="' + invalidBlobUriSrc + '">'
    );

    imageScanner.findAll(viewBlock.get()).then(function (result) {
      done();
      const blobInfo = result[0].blobInfo;
      LegacyUnit.equal(result.length, 3);
      LegacyUnit.equal(typeof result[result.length - 1], 'string', 'Last item is not the image, but error message.');
      LegacyUnit.equal('data:image/gif;base64,' + blobInfo.base64(), base64Src);
      LegacyUnit.equalDom(result[0].image, viewBlock.get().firstChild);
    });
  });

  suite.asyncTest('findAll (filtered)', function (_, done) {
    const imageScanner = ImageScanner(UploadStatus(), BlobCache());

    const predicate = function (img) {
      return !img.hasAttribute('data-skip');
    };

    viewBlock.update(
      '<img src="' + base64Src + '">' +
      '<img src="' + base64Src + '" data-skip="1">'
    );

    imageScanner.findAll(viewBlock.get(), predicate).then(function (result) {
      done();
      LegacyUnit.equal(result.length, 1);
      LegacyUnit.equal('data:image/gif;base64,' + result[0].blobInfo.base64(), base64Src);
      LegacyUnit.equalDom(result[0].image, viewBlock.get().firstChild);
    });
  });

  Conversions.uriToBlob(base64Src).then(function (blob) {
    blobUriSrc = URL.createObjectURL(blob);

    viewBlock.attach();
    Pipeline.async({}, suite.toSteps({}), function () {
      viewBlock.detach();
      success();
    }, failure);
  });
});
