import { Arr, Obj, Type } from '@ephox/katamari';

import AstNode from '../api/html/Node';
import Schema, { SchemaMap } from '../api/html/Schema';
import * as NodeType from '../dom/NodeType';

export const transparentBlockAttr = 'data-mce-block';

const makeSelectorFromSchemaMap = (map: SchemaMap) => Arr.filter(Obj.keys(map), (key) => /^[a-z]+$/.test(key)).join(',');

export const update = (schema: Schema, root: Element, inEditorRoot: boolean): void => {
  const transparentSelector = makeSelectorFromSchemaMap(schema.getTransparentElements());
  const blocksSelector = makeSelectorFromSchemaMap(schema.getBlockElements());

  Arr.each(root.querySelectorAll(transparentSelector), (transparent) => {
    if ((inEditorRoot && transparent.parentElement === root) || transparent.querySelectorAll(blocksSelector).length > 0) {
      transparent.setAttribute(transparentBlockAttr, 'true');

      if (transparent.getAttribute('data-mce-selected') === 'inline-boundary') {
        transparent.removeAttribute('data-mce-selected');
      }
    } else {
      transparent.removeAttribute(transparentBlockAttr);
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
