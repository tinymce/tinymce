define(
  'ephox.alloy.behaviour.sandboxing.SandboxState',

  [
    'ephox.alloy.behaviour.common.BehaviourState',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option'
  ],

  function (BehaviourState, Cell, Fun, Option) {
    var init = function () {
      var contents = Cell(Option.none());

      var readState = Fun.constant('not-implemented');

      var isOpen = function () {
        return contents.get().isSome();
      };

      var set = function (c) {
        contents.set(Option.some(c));
      };

      var get = function (c) {
        return contents.get();
      };

      var clear = function () {
        contents.set(Option.none());
      };

      return BehaviourState({
        readState: readState,
        isOpen: isOpen,
        clear: clear,
        set: set,
        get: get
      });
    };
    
    return {
      init: init
    };
  }
);
