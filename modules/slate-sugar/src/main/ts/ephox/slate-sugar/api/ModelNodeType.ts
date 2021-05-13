import { ModelApi, ModelNode, ModelElement, ModelText } from './Api';

const isElement = (api: ModelApi, node: ModelNode): node is ModelElement =>
  api.modelNodeType.isElement(node);

const isText = (api: ModelApi, node: ModelNode): node is ModelText =>
  api.modelNodeType.isText(node);

const isBlock = (api: ModelApi, node: ModelNode): boolean =>
  api.modelNodeType.isBlock(node);

const isInline = (api: ModelApi, node: ModelNode): boolean =>
  api.modelNodeType.isInline(node);

export {
  isElement,
  isText,
  isBlock,
  isInline
};
