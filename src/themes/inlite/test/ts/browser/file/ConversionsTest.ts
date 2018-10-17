import { Assertions, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Uint8Array, Window } from '@ephox/sand';

import Conversions from 'tinymce/themes/inlite/file/Conversions';
import { Blob } from '@ephox/dom-globals';

UnitTest.asynctest('atomic.core.ConvertTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  const base64ToBlob = function (base64, type) {
    const buff = Window.atob(base64);
    const bytes = Uint8Array(buff.length);

    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = buff.charCodeAt(i);
    }

    return new Blob([bytes], { type });
  };

  const sBlobToBase64 = function () {
    return Step.async(function (next) {
      const base64 = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      const blob = base64ToBlob(base64, 'image/gif');

      Conversions.blobToBase64(blob).then(function (convertedBase64) {
        Assertions.assertEq('Not the correct base64', base64, convertedBase64);
        next();
      });
    });
  };

  Pipeline.async({}, [
    sBlobToBase64()
  ], function () {
    success();
  }, function () {
    failure();
  });
});
