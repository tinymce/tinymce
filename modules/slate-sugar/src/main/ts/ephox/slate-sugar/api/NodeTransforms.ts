import { ModelApi, path } from './Api';

const setPropsByPath = (api: ModelApi, path: path, props: Record<string, string>): void =>
  api.nodeTransforms.setPropsByPath(path, props);

const removePropsByPath = (api: ModelApi, path: path, props: string[]): void =>
  api.nodeTransforms.removePropsByPath(path, props);

export {
  setPropsByPath,
  removePropsByPath
};
