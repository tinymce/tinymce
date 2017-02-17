define(
  'ephox.alloy.behaviour.sandboxing.SandboxApis',

  [
    'ephox.knoch.future.Future',
    'ephox.perhaps.Option',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove'
  ],

  function (Future, Option, Insert, Remove) {
    var clear = function (sandbox, sInfo) {
      sInfo.state().get().each(function (data) {
        sandbox.getSystem().removeFromWorld(data);
        sInfo.bucket().glue().remove(sandbox, sInfo.bucket());
      });
    };

    var empty = function (sandbox) {
      Remove.empty(sandbox.element());
      sandbox.syncComponents();
    };

    // NOTE: A sandbox should not start as part of the world. It is expected to be
    // added to the sink on rebuild.
    var rebuild = function (sandbox, sInfo, data) {
      clear(sandbox, sInfo);
      empty(sandbox);

      sInfo.bucket().glue().add(sandbox, sInfo.bucket());
      var built = sandbox.getSystem().build(data);

      Insert.append(sandbox.element(), built.element());
      sandbox.getSystem().addToWorld(built);
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
        sandbox.getSystem().removeFromWorld(data);
        empty(sandbox);

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