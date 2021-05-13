import { ModelApi, path, ModelLocation } from './Api';

const toPathArray = (api: ModelApi, loc: ModelLocation): path =>
  api.slateLoc.toPathArray(loc);

export {
  toPathArray
};
