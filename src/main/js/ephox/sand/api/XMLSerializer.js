define(
  'ephox.sand.api.XMLSerializer',

  [
    'ephox.sand.util.Global'
  ],

  function (Global) {
    /*
     * IE9 and above per
     * https://developer.mozilla.org/en/docs/XMLSerializer
     */
    var xmlserializer = function () {
      var f = Global.getOrDie('XMLSerializer');
      return new f();
    };

    var serializeToString = function (node) {
      return xmlserializer().serializeToString(node);
    };

    return {
      serializeToString: serializeToString
    };
  }
);