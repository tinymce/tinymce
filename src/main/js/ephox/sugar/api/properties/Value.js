define(
  'ephox.sugar.api.properties.Value',

  [
    'global!Error'
  ],

  function (Error) {
    var get = function (element) {
      return element.dom().value;
    };

    var set = function (element, value) {
      if (value === undefined) throw new Error('Value.set was undefined');
      element.dom().value = value;
    };

    return {
      set: set,
      get: get
    };
  }
);
