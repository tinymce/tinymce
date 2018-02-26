import { Contracts } from '@ephox/katamari';

const contract = Contracts.exactly([
  'clear',
  'populate',
  'preview',
  'enter',
  'isPartOf'
]);

const clear = function (sandbox, sInfo) {
  sInfo.state().get().each(function (state) {
    sInfo.manager().clear(sandbox, state);
  });
};

const populate = function (sandbox, sInfo, data) {
  return sInfo.manager().populate(sandbox, data);
};

const preview = function (sandbox, sInfo) {
  sInfo.state().get().each(function (state) {
    sInfo.manager().preview(sandbox, state);
  });
};

const enter = function (sandbox, sInfo) {
  sInfo.state().get().each(function (state) {
    sInfo.manager().enter(sandbox, state);
  });
};

const isPartOf = function (sandbox, sInfo, queryElem) {
  return sInfo.state().get().exists(function (state) {
    return sInfo.manager().isPartOf(sandbox, state, queryElem);
  });
};

export {
  contract,
  clear,
  populate,
  preview,
  enter,
  isPartOf
};