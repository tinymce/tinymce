import { Arr, Obj, Type } from '@ephox/katamari';
import { Compare, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import AstNode from '../api/html/Node';
import Schema, { SchemaMap } from '../api/html/Schema';
import * as NodeType from '../dom/NodeType';

export const transparentBlockAttr = 'data-mce-block';

// Returns the lowercase element names form a SchemaMap by excluding anyone that has uppercase letters.
// This method is to avoid having to specify all possible valid characters other than lowercase a-z such as '-' or ':' etc.
export const elementNames = (map: SchemaMap): string[] => Arr.filter(Obj.keys(map), (key) => !/[A-Z]/.test(key));

const makeSelectorFromSchemaMap = (map: SchemaMap) => elementNames(map).join(',');

const updateTransparent = (blocksSelector: string, transparent: Element) => {
  if (Type.isNonNullable(transparent.querySelector(blocksSelector))) {
    transparent.setAttribute(transparentBlockAttr, 'true');

    if (transparent.getAttribute('data-mce-selected') === 'inline-boundary') {
      transparent.removeAttribute('data-mce-selected');
    }
  } else {
    transparent.removeAttribute(transparentBlockAttr);
  }
};

export const updateChildren = (schema: Schema, scope: Element): void => {
  const transparentSelector = makeSelectorFromSchemaMap(schema.getTransparentElements());
  const blocksSelector = makeSelectorFromSchemaMap(schema.getBlockElements());

  Arr.each(scope.querySelectorAll(transparentSelector), (transparent) => updateTransparent(blocksSelector, transparent));
};

export const updateElement = (schema: Schema, target: Element): void => {
  if (isTransparentElement(schema, target)) {
    const blocksSelector = makeSelectorFromSchemaMap(schema.getBlockElements());
    updateTransparent(blocksSelector, target);
  }
};

export const updateCaret = (schema: Schema, root: Element, caretParent: Element): void => {
  const isRoot = (el: SugarElement<Node>) => Compare.eq(el, SugarElement.fromDom(root));
  const parents = Traverse.parents(SugarElement.fromDom(caretParent), isRoot);
  // Check the element just above below the root so in if caretParent is I in this
  // case <body><p><b><i>|</i></b></p></body> it would use the P as the scope
  Arr.get(parents, parents.length - 2).filter(SugarNode.isElement).fold(
    () => updateChildren(schema, root),
    (scope) => updateChildren(schema, scope.dom)
  );
};

export const isTransparentElementName = (schema: Schema, name: string): boolean => Obj.has(schema.getTransparentElements(), name);

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
