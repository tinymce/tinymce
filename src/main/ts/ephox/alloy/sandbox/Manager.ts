import { Contracts } from '@ephox/katamari';

const contract = Contracts.exactly([
  'clear',
  'populate',
  'preview',
  'enter',
  'isPartOf'
]);

const clear = (sandbox, sInfo) => {
  sInfo.state().get().each((state) => {
    sInfo.manager().clear(sandbox, state);
  });
};

const populate = (sandbox, sInfo, data) => {
  return sInfo.manager().populate(sandbox, data);
};

const preview = (sandbox, sInfo) => {
  sInfo.state().get().each((state) => {
    sInfo.manager().preview(sandbox, state);
  });
};

const enter = (sandbox, sInfo) => {
  sInfo.state().get().each((state) => {
    sInfo.manager().enter(sandbox, state);
  });
};

const isPartOf = (sandbox, sInfo, queryElem) => {
  return sInfo.state().get().exists((state) => {
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