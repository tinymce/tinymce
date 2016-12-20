define(
  'ephox.sand.api.Uint8Array',

  [
    'ephox.sand.util.Global'
  ],

  function (Global) {
    /*
     * https://developer.mozilla.org/en-US/docs/Web/API/Uint8Array
     *
     * IE10 and above per
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays
     */
    return function (arr) {
      var f = Global.getOrDie('Uint8Array');
      return new f(arr);
    };
  }
);