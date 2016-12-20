define(
  'ephox.sand.api.NodeFilter',

  [
    'ephox.sand.util.Global'
  ],

  function (Global) {
    /*
     * IE9 and above per
     * https://developer.mozilla.org/en-US/docs/Web/API/NodeFilter
     */
    return function () {
      var f = Global.getOrDie('NodeFilter');
      return f;
    };
  }
);