define(
  'ephox.sand.api.Blob',

  [
    'ephox.sand.util.Global'
  ],

  function (Global) {
    /*
     * IE10 and above per
     * https://developer.mozilla.org/en-US/docs/Web/API/Blob
     */
    return function (parts, properties) {
      var f = Global.getOrDie('Blob');
      return new f(parts, properties);
    };
  }
);