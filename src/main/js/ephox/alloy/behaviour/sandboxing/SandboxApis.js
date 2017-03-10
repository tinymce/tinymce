define(
  'ephox.alloy.behaviour.sandboxing.SandboxApis',

  [
    'ephox.alloy.api.system.Attachment',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Option'
  ],

  function (Attachment, Future, Option) {
    // NOTE: A sandbox should not start as part of the world. It is expected to be
    // added to the sink on rebuild.
    var rebuild = function (sandbox, sInfo, data) {
      sInfo.state().get().each(function (data) {
        // If currently has data, so it hasn't been removed yet. It is 
        // being "re-opened"
        Attachment.detachChildren(sandbox);
      });
      
      var point = sInfo.getAttachPoint()();
      Attachment.attach(point, sandbox);

      // Must be after the sandbox is in the system
      var built = sandbox.getSystem().build(data);
      Attachment.attach(sandbox, built);
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
        Attachment.detachChildren(sandbox);
        Attachment.detach(sandbox);
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