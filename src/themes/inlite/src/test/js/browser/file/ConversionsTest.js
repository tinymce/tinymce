asynctest(
  'atomic.core.ConvertTest',
  [
    'tinymce.themes.inlite.file.Conversions',
    'ephox.agar.api.Step',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Assertions'
  ],
  function (Conversions, Step, Pipeline, Assertions) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var base64ToBlob = function (base64, type) {
      var buff = atob(base64);
      var bytes = new Uint8Array(buff.length);

      for (var i = 0; i < bytes.length; i++) {
        bytes[i] = buff.charCodeAt(i);
      }

      return new Blob([bytes], { type: type });
    };

    var sBlobToBase64 = function () {
      return Step.async(function (next) {
        var base64 = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        var blob = base64ToBlob(base64, 'image/gif');

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
  }
);
