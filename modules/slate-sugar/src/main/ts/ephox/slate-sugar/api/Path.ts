import { Maybes, Maybe } from '@ephox/katamari';
import { ModelApi, path, ModelLocation } from './Api';

const modelLocationToPath = (api: ModelApi, loc: ModelLocation): path =>
  api.path.modelLocationToPath(loc);

const pathToModelLocation = (api: ModelApi, path: path): Maybe<ModelLocation> =>
  Maybes.from(api.path.pathToModelLocation(path));

export {
  modelLocationToPath,
  pathToModelLocation
};
