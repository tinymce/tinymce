define(
  'ephox.alloy.api.behaviour.Behaviour',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.boulder.api.Objects',
    'ephox.peanut.Fun'
  ],

  function (BehaviourExport, Objects, Fun) {
    var derive = function (capabilities) {
      return Objects.wrapAll(capabilities);
    };

    var dom = function (name, modification) {
      return BehaviourExport.exhibitor(name, function (base, info) {
        return modification;
      });
    };

    return {
      derive: derive,
      dom: dom,
      revoke: Fun.constant(undefined)
    };
  }
);