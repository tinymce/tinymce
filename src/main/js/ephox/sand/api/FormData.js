define(
  'ephox.sand.api.FormData',

  [
    'ephox.sand.util.Global'
  ],

  function (Global) {
    /*
     * IE10 and above per
     * https://developer.mozilla.org/en-US/docs/Web/API/FormData
     */
    return function () {
      var f = Global.getOrDie('FormData');
      return new f();
    };
  }
);