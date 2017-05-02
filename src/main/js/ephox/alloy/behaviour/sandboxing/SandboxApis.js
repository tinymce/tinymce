define(
  'ephox.alloy.behaviour.sandboxing.SandboxApis',

  [
    'ephox.alloy.api.system.Attachment',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.properties.Css'
  ],

  function (Attachment, Future, Option, Css) {
    // NOTE: A sandbox should not start as part of the world. It is expected to be
    // added to the sink on rebuild.
    var rebuild = function (sandbox, sConfig, sState, data) {
      sState.get().each(function (data) {
        // If currently has data, so it hasn't been removed yet. It is 
        // being "re-opened"
        Attachment.detachChildren(sandbox);
      });
      
      var point = sConfig.getAttachPoint()();
      Attachment.attach(point, sandbox);

      // Must be after the sandbox is in the system
      var built = sandbox.getSystem().build(data);
      Attachment.attach(sandbox, built);
      sState.set(built);
      return built;
    };

    // Handling async. Will probably get rid of. Just means that the
    // rebuilding and showing can happen more quickly for sync.
    var processData = function (sandbox, sConfig, sState, data, f) {
      if (sConfig.async()) {
        return data.map(f);
      } else {
        var r = f(data);
        return Future.pure(r);
      }
    };

    // Open sandbox transfers focus to the opened menu
    var open = function (sandbox, sConfig, sState, data) {
      return processData(sandbox, sConfig, sState, data, function (data) {
        var state = rebuild(sandbox, sConfig, sState, data);
        sConfig.onOpen()(sandbox, state);
        return state;
      });
    };

    var close = function (sandbox, sConfig, sState) {
      sState.get().each(function (data) {
        Attachment.detachChildren(sandbox);
        Attachment.detach(sandbox);
        sConfig.onClose()(sandbox, data);
        sState.clear();
      });
    };

    var isOpen = function (sandbox, sConfig, sState) {
      return sState.isOpen();
    };

    var isPartOf = function (sandbox, sConfig, sState, queryElem) {
      return isOpen(sandbox, sConfig, sState) && sState.get().exists(function (data) {
        return sConfig.isPartOf()(sandbox, data, queryElem);
      });
    };

    var getState = function (sandbox, sConfig, sState) {
      return sState.get();
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