define(
  'ephox.sand.api.URL',

  [
    'ephox.sand.util.Global'
  ],

  function (Global) {
    /*
     * IE10 and above per
     * https://developer.mozilla.org/en-US/docs/Web/API/URL.createObjectURL
     *
     * Also Safari 6.1+
     * Safari 6.0 has 'webkitURL' instead, but doesn't support flexbox so we
     * aren't supporting it anyway
     */
    var url = function () {
      return Global.getOrDie('URL');
    };

    var createObjectURL = function (blob) {
      return url().createObjectURL(blob);
    };

    var revokeObjectURL = function (u) {
      url().revokeObjectURL(u);
    };

    return {
      createObjectURL: createObjectURL,
      revokeObjectURL: revokeObjectURL
    };
  }
);