import { ModelApi, ModelNode, path } from './Api';
import { setPropsAtPath } from './NodeTransforms';

const get = (api: ModelApi, node: ModelNode, key: string): any => api.attribute.getAttribute(node, key);
const getAll = (api: ModelApi, node: ModelNode): Record<string, string> => api.attribute.getAttributes(node);
const has = (api: ModelApi, node: ModelNode, key: string): boolean => api.attribute.hasAttribute(node, key);
const removeAllByPath = (api: ModelApi, path: path, keys: string[]): void => api.attribute.removePropsAtPath(path, keys);
const removeByPath = (api: ModelApi, path: path, key: string): void => api.attribute.removePropsAtPath(path, [ key ]);
const setAllByPath = (api: ModelApi, path: path, props: Record<string, string>): void => setPropsAtPath(api, path, props);
const setByPath = (api: ModelApi, path: path, key: string, value: string): void => setPropsAtPath(api, path, { [key]: value });

export {
  get,
  getAll,
  has,
  removeAllByPath,
  removeByPath,
  setAllByPath,
  setByPath
};
