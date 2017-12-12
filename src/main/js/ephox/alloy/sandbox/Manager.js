import { Contracts } from '@ephox/katamari';

var contract = Contracts.exactly([
  'clear',
  'populate',
  'preview',
  'enter',
  'isPartOf'
]);

var clear = function (sandbox, sInfo) {
  sInfo.state().get().each(function (state) {
    sInfo.manager().clear(sandbox, state);
  });
};

var populate = function (sandbox, sInfo, data) {
  return sInfo.manager().populate(sandbox, data);
};

var preview = function (sandbox, sInfo) {
  sInfo.state().get().each(function (state) {
    sInfo.manager().preview(sandbox, state);
  });
};

var enter = function (sandbox, sInfo) {
  sInfo.state().get().each(function (state) {
    sInfo.manager().enter(sandbox, state);
  });
};

var isPartOf = function (sandbox, sInfo, queryElem) {
  return sInfo.state().get().exists(function (state) {
    return sInfo.manager().isPartOf(sandbox, state, queryElem);
  });
};

export default <any> {
  contract: contract,
  clear: clear,
  populate: populate,
  preview: preview,
  enter: enter,
  isPartOf: isPartOf
};