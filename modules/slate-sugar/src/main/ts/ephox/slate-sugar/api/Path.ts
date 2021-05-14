import { ModelApi, path, ModelLocation } from './Api';

const modelLocationToPath = (api: ModelApi, loc: ModelLocation): path =>
  api.path.modelLocationToPath(loc);

export {
  modelLocationToPath
};
