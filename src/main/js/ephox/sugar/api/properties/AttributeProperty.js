define(
  'ephox.sugar.api.properties.AttributeProperty',

  [
    'ephox.sugar.api.properties.Attr'
  ],

  function (Attr) {
    return function (attribute, value) {
      var is = function (element) {
        return Attr.get(element, attribute) === value;
      };

      var remove = function (element) {
        Attr.remove(element, attribute);
      };

      var set = function (element) {
        Attr.set(element, attribute, value);
      };

      return {
        is: is,
        remove: remove,
        set: set
      };
    };
  }
);