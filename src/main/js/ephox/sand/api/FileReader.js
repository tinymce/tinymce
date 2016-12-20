define(
  'ephox.sand.api.FileReader',

  [
    'ephox.sand.util.Global'
  ],

  function (Global) {
    /*
     * IE10 and above per
     * https://developer.mozilla.org/en-US/docs/Web/API/FileReader
     */
    return function () {
      var f = Global.getOrDie('FileReader');
      return new f();
    };
  }
);