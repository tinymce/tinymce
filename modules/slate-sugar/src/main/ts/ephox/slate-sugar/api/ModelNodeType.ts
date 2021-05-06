import { ModelApi, SlateNode, SlateElement, SlateText } from './Api';

const isElement = (api: ModelApi, node: SlateNode): node is SlateElement =>
  api.modelNodeType.isElement(node);

const isText = (api: ModelApi, node: SlateNode): node is SlateText =>
  api.modelNodeType.isText(node);

const isBlock = (api: ModelApi, node: SlateNode): boolean =>
  api.modelNodeType.isBlock(node);

const isInline = (api: ModelApi, node: SlateNode): boolean =>
  api.modelNodeType.isInline(node);

export {
  isElement,
  isText,
  isBlock,
  isInline
};

