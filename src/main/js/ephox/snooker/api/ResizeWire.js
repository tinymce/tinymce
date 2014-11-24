define(
  'ephox.snooker.api.ResizeWire',

  [
    'ephox.peanut.Fun',
    'ephox.scullion.Struct'
  ],

  function (Fun, Struct) {
    var wire = Struct.immutable('parent', 'view');

    var only = function (element) {
      return wire(element, element);
    };

    var detached = function (editable, chrome) {
      return wire(chrome, editable);
    };

    return {
      only: only,
      detached: detached
    };
  }
);