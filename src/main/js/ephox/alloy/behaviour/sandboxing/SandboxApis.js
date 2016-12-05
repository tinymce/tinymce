define(
  'ephox.alloy.behaviour.sandboxing.SandboxApis',

  [
    'ephox.knoch.future.Future',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Remove'
  ],

  function (Future, Option, Remove) {
    var clear = function (sandbox, sInfo) {
      sInfo.state().get().each(function (state) {
        sInfo.clear()(sandbox, state);
        sInfo.bucket().glue().remove(sandbox, sInfo.bucket());
      });
    };

    // NOTE: A sandbox should not start as part of the world. It is expected to be
    // added to the sink on rebuild.
    var rebuild = function (sandbox, sInfo, data) {
      clear(sandbox, sInfo);
      Remove.empty(sandbox.element());

      sInfo.bucket().glue().add(sandbox, sInfo.bucket());
      var output = sInfo.populate()(sandbox, data);
      sInfo.state().set(
        Option.some(output)
      );
      return output;
    };

    var processData = function (sandbox, sInfo, data, f) {
      if (sInfo.async()) {
        return data.map(f);
      } else {
        var processed = f(data);
        return Future.pure(processed);
      }
    };

    // Open sandbox transfers focus to the opened menu
    var open = function (sandbox, sInfo, rawData) {
      return processData(sandbox, sInfo, rawData, function (data) {
        var state = rebuild(sandbox, sInfo, data);
        sInfo.onOpen()(sandbox, state);
        return state;
      });
    };

    var close = function (sandbox, sInfo) {
      sInfo.state().get().each(function (state) {
        sInfo.clear()(sandbox, state);
        Remove.empty(sandbox.element());

        sInfo.bucket().glue().remove(sandbox, sInfo.bucket());
        sInfo.onClose()(sandbox, state);
        sInfo.state().set(Option.none());
      });
    };

    var isOpen = function (sandbox, sInfo) {
      return sInfo.state().get().isSome();
    };

    var isPartOf = function (sandbox, sInfo, queryElem) {
      return isOpen(sandbox, sInfo) && sInfo.state().get().exists(function (state) {
        return sInfo.isPartOf()(sandbox, state, queryElem);
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