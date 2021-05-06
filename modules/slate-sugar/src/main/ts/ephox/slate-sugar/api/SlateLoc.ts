import { ModelApi, path, SlateLoc } from './Api';

const toPathArray = (api: ModelApi, loc: SlateLoc): path =>
  api.slateLoc.toPathArray(loc);

export {
  toPathArray
};

