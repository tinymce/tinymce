define(
  'ephox.snooker.api.CellProperties',

  [
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.dom.Replication'
  ],

  function (Fun, Attr, Css, Insert, Remove, Replication) {
    var setBorderColor = function (cell, value) {
      Css.set(cell, 'border-color', value);
      Css.getRaw(cell, 'border-style').fold(function () {
        /* required by older browsers */
        Css.set(cell, 'border-style', 'solid');
      }, Fun.noop); // do nothing when already set
    };

    var setBackgroundColor = function (cell, value) {
      Css.set(cell, 'background-color', value);
    };

    var setHeight = function (cell, value) {
      Css.set(cell, 'height', value);
    };

    var setWidth = function (cell, value) {
      Css.set(cell, 'width', value);
    };

    var setType = function (cell, type) {
      var replica = Replication.copy(cell, tag);
      Insert.after(cell, replica);
      Remove.remove(cell);
    };

    var setScope = function (cell, value) {
      Attr.set(cell, 'scope', value);
    };

    var setStyle = function (cell, value) {
      Attr.set(cell, 'style', value);
    };

    var setClass = function (cell, value) {
      Attr.set(cell, 'class', value);
    };

    return {
      setBorderColor: setBorderColor,
      setBackgroundColor: setBackgroundColor,
      setHeight: setHeight,
      setWidth: setWidth,
      setType: setType,
      setScope: setScope,
      setStyle: setStyle,
      setClass: setClass
    };
  }
);
