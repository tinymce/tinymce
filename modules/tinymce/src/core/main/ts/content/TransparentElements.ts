import { Arr, Obj, Type } from '@ephox/katamari';
import { Compare, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import AstNode from '../api/html/Node';
import Schema, { SchemaMap } from '../api/html/Schema';
import * as NodeType from '../dom/NodeType';

export const transparentBlockAttr = 'data-mce-block';

const makeSelectorFromSchemaMap = (map: SchemaMap) => Arr.filter(Obj.keys(map), (key) => /^[a-z]+$/.test(key)).join(',');

const updateAt = (schema: Schema, root: Element, scope: Element, inEditorRoot: boolean) => {
  const transparentSelector = makeSelectorFromSchemaMap(schema.getTransparentElements());
  const blocksSelector = makeSelectorFromSchemaMap(schema.getBlockElements());

  Arr.each(scope.querySelectorAll(transparentSelector), (transparent) => {
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

export const update = (schema: Schema, root: Element, inEditorRoot: boolean): void => updateAt(schema, root, root, inEditorRoot);

export const updateCaret = (schema: Schema, root: Element, caretParent: Element): void => {
  const isRoot = (el: SugarElement<Node>) => Compare.eq(el, SugarElement.fromDom(root));
  const parents = Traverse.parents(SugarElement.fromDom(caretParent), isRoot);
  // Check the element just above below the root so in if caretParent is I in this
  // case <body><p><b><i>|</i></b></p></body> it would use the P as the scope
  Arr.get(parents, parents.length - 2).filter(SugarNode.isElement).fold(
    () => update(schema, root, true),
    (scope) => updateAt(schema, root, scope.dom, true)
  );
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
