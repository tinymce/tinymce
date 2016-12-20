define(
  'ephox.sand.api.XMLHttpRequest',

  [
    'ephox.sand.util.Global'
  ],

  function (Global) {
    /*
     * IE8 and above per
     * https://developer.mozilla.org/en/docs/XMLHttpRequest
     */
    return function () {
      var f = Global.getOrDie('XMLHttpRequest');
      return new f();
    };
  }
);