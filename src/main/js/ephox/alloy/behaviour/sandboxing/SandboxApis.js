define(
  'ephox.alloy.behaviour.sandboxing.SandboxApis',

  [
    'ephox.compass.Arr',
    'ephox.knoch.future.Future',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove'
  ],

  function (Arr, Future, Option, Insert, Remove) {
    var clear = function (sandbox, sInfo) {
      sInfo.state().get().each(function (data) {
        Arr.each(data, sandbox.getSystem().removeFromWorld);
        sInfo.bucket().glue().remove(sandbox, sInfo.bucket());
      });
    };

    // NOTE: A sandbox should not start as part of the world. It is expected to be
    // added to the sink on rebuild.
    var rebuild = function (sandbox, sInfo, data) {
      clear(sandbox, sInfo);
      Remove.empty(sandbox.element());

      sInfo.bucket().glue().add(sandbox, sInfo.bucket());
      var built = sandbox.getSystem().build(data);
      sandbox.getSystem().addToWorld(built);
      Insert.append(sandbox.element(), built.element());
      sandbox.syncComponents();

      sInfo.state().set(
        Option.some(built)
      );
      return built;
    };

    // Handling async. Will probably get rid of. Just means that the
    // rebuilding and showing can happen more quickly for sync.
    var processData = function (sandbox, sInfo, data, f) {
      if (sInfo.async()) {
        return data.map(f);
      } else {
        var r = f(data);
        return Future.pure(r);
      }
    };

    // Open sandbox transfers focus to the opened menu
    var open = function (sandbox, sInfo, data) {
      return processData(sandbox, sInfo, data, function (data) {
        var state = rebuild(sandbox, sInfo, data);
        sInfo.onOpen()(sandbox, state);
        return state;
      });
    };

    var close = function (sandbox, sInfo) {
      sInfo.state().get().each(function (data) {
        Arr.each(data, sandbox.getSystem().removeFromWorld);
        Remove.empty(sandbox.element());

        sInfo.bucket().glue().remove(sandbox, sInfo.bucket());
        sInfo.onClose()(sandbox, data);
        sInfo.state().set(Option.none());
      });
    };

    var isOpen = function (sandbox, sInfo) {
      return sInfo.state().get().isSome();
    };

    var isPartOf = function (sandbox, sInfo, queryElem) {
      return isOpen(sandbox, sInfo) && sInfo.state().get().exists(function (data) {
        return sInfo.isPartOf()(sandbox, data, queryElem);
      });
    };

    var getState = function (sandbox, sInfo) {
      return sInfo.state().get();
    };

    return {
      open: open,
      close: close,
      isOpen: isOpen,
      isPartOf: isPartOf,
      getState: getState
    };
  }
);