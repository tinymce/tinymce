define(
  'ephox.alloy.sandbox.Manager',

  [
    'ephox.scullion.Contracts'
  ],

  function (Contracts) {
    var contract = Contracts.exactly([
      'clear',
      'populate',
      'preview',
      'enter',
      'isPartOf'
    ]);

    var clear = function (sandbox, sInfo) {
      sInfo.manager().clear(sandbox, sInfo.state().get());
    };

    var populate = function (sandbox, sInfo, data) {
      return sInfo.manager().populate(sandbox, data);
    };

    var preview = function (sandbox, sInfo) {
      sInfo.manager().preview(sandbox, sInfo.state().get());
    };

    var enter = function (sandbox, sInfo) {
      sInfo.manager().enter(sandbox, sInfo.state().get());
    };

    var isPartOf = function (sandbox, sInfo, queryElem) {
      sInfo.manager().isPartOf(sandbox, sInfo.state().get(), queryElem);
    };

    return {
      contract: contract,
      clear: clear,
      populate: populate,
      preview: preview,
      enter: enter,
      isPartOf: isPartOf
    };
  }
);