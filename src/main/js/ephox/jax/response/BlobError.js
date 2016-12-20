define(
  'ephox.jax.response.BlobError',

  [
    'ephox.katamari.api.Future',
    'ephox.sand.api.FileReader'
  ],

  function (Future, FileReader) {
    return function (blob) {
      return Future.nu(function (callback) {
        var fr = FileReader();
        fr.onload = function (e) {
          var data = e.target;
          callback(data.result);
        };
        fr.readAsText(blob);
      });
    };
  }
);