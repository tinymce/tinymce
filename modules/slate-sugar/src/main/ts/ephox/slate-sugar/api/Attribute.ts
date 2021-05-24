import { ModelApi, ModelNode, path } from './Api';

const get = (api: ModelApi, node: ModelNode, key: string): any => api.attribute.getAttribute(node, key);
const getAll = (api: ModelApi, node: ModelNode): Record<string, string> => api.attribute.getAttributes(node);
const has = (api: ModelApi, node: ModelNode, key: string): boolean => api.attribute.hasAttribute(node, key);
const removeAllByPath = (api: ModelApi, path: path, keys: string[]): void => api.attribute.removeAttributesByPath(path, keys);
const removeByPath = (api: ModelApi, path: path, key: string): void => api.attribute.removeAttributesByPath(path, [ key ]);
const setAllByPath = (api: ModelApi, path: path, attrs: Record<string, string>): void => api.attribute.setAttributesByPath(path, attrs);
const setByPath = (api: ModelApi, path: path, key: string, value: string): void => api.attribute.setAttributesByPath(path, { [key]: value });

export {
  get,
  getAll,
  has,
  removeAllByPath,
  removeByPath,
  setAllByPath,
  setByPath
};
