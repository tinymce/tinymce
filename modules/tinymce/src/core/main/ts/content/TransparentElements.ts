import { Arr, Type } from '@ephox/katamari';

import AstNode from '../api/html/Node';
import Schema from '../api/html/Schema';
import * as NodeType from '../dom/NodeType';

export const transparentBlockAttr = 'data-mce-block';

export const update = (schema: Schema, root: Element, inEditorRoot: boolean): void => {
  const transparentSelector = Object.keys(schema.getTransparentElements()).join(',');
  const blocksSelector = Object.keys(schema.getBlockElements()).join(',');

  Arr.each(root.querySelectorAll(transparentSelector), (anchor) => {
    if ((inEditorRoot && anchor.parentElement === root) || anchor.querySelectorAll(blocksSelector).length > 0) {
      anchor.setAttribute(transparentBlockAttr, 'true');
    } else {
      anchor.removeAttribute(transparentBlockAttr);
    }
  });
};

export const isTransparentElementName = (schema: Schema, name: string): boolean => name in schema.getTransparentElements();

const isTransparentElement = (schema: Schema, node: Node | null | undefined): node is Element =>
  NodeType.isElement(node) && isTransparentElementName(schema, node.nodeName);

export const isTransparentBlock = (schema: Schema, node: Node | null | undefined): node is Element =>
  isTransparentElement(schema, node) && node.hasAttribute(transparentBlockAttr);

export const isTransparentInline = (schema: Schema, node: Node | null | undefined): node is Element =>
  isTransparentElement(schema, node) && !node.hasAttribute(transparentBlockAttr);

export const isTransparentAstBlock = (schema: Schema, node: AstNode): boolean =>
  node.type === 1 && isTransparentElementName(schema, node.name) && Type.isString(node.attr(transparentBlockAttr));

export const isTransparentAstInline = (schema: Schema, node: AstNode): boolean =>
  node.type === 1 && isTransparentElementName(schema, node.name) && Type.isUndefined(node.attr(transparentBlockAttr));
