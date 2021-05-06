import { ModelApi, path } from './Api';

const setPropsAtPath = (api: ModelApi, path: path, props: Record<string, string>): void =>
  api.nodeTransforms.setPropsAtPath(path, props);

export {
  setPropsAtPath
};
