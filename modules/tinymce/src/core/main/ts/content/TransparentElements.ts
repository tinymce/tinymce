import { Arr, Type } from '@ephox/katamari';

import AstNode from '../api/html/Node';
import Schema from '../api/html/Schema';
import * as NodeType from '../dom/NodeType';

export const update = (schema: Schema, root: Element, inEditorRoot: boolean): void => {
  const transparentSelector = Object.keys(schema.getTransparentElements()).join(',');
  const blocksSelector = Object.keys(schema.getBlockElements()).join(',');

  Arr.each(root.querySelectorAll(transparentSelector), (anchor) => {
    if ((inEditorRoot && anchor.parentElement === root) || anchor.querySelectorAll(blocksSelector).length > 0) {
      anchor.setAttribute('data-mce-block', 'true');
    } else {
      anchor.removeAttribute('data-mce-block');
    }
  });
};

export const isTransparentBlock = (schema: Schema, node: Node): boolean =>
  NodeType.isElement(node) && node.nodeName in schema.getTransparentElements() && node.hasAttribute('data-mce-block');

export const isTransparentInline = (schema: Schema, node: Node): boolean =>
  NodeType.isElement(node) && node.nodeName in schema.getTransparentElements() && !node.hasAttribute('data-mce-block');

export const isTransparentAstBlock = (schema: Schema, node: AstNode): boolean =>
  node.type === 1 && node.name in schema.getTransparentElements() && Type.isString(node.attr('data-mce-block'));

export const isTransparentAstInline = (schema: Schema, node: AstNode): boolean =>
  node.type === 1 && node.name in schema.getTransparentElements() && Type.isUndefined(node.attr('data-mce-block'));
