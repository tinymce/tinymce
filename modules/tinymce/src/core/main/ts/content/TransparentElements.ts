import { Arr, Obj, Type } from '@ephox/katamari';
import { Compare, PredicateFilter, PredicateFind, Remove, SelectorFilter, SugarElement, SugarElements, SugarNode, Traverse } from '@ephox/sugar';

import AstNode from '../api/html/Node';
import Schema, { SchemaMap } from '../api/html/Schema';
import * as Empty from '../dom/Empty';
import * as NodeType from '../dom/NodeType';
import * as Namespace from '../html/Namespace';

export const transparentBlockAttr = 'data-mce-block';

// Returns the lowercase element names form a SchemaMap by excluding anyone that has uppercase letters.
// This method is to avoid having to specify all possible valid characters other than lowercase a-z such as '-' or ':' etc.
export const elementNames = (map: SchemaMap): string[] => Arr.filter(Obj.keys(map), (key) => !/[A-Z]/.test(key));

const makeSelectorFromSchemaMap = (map: SchemaMap) =>
  Arr.map(elementNames(map), (name) => {
    // Exclude namespace elements from processing
    return `${name}:` + Arr.map(Namespace.namespaceElements, (ns) => `not(${ns} ${name})`).join(':');
  }).join(',');

const updateTransparent = (blocksSelector: string, transparent: Element) => {
  if (Type.isNonNullable(transparent.querySelector(blocksSelector))) {
    transparent.setAttribute(transparentBlockAttr, 'true');

    if (transparent.getAttribute('data-mce-selected') === 'inline-boundary') {
      transparent.removeAttribute('data-mce-selected');
    }

    return true;
  } else {
    transparent.removeAttribute(transparentBlockAttr);
    return false;
  }
};

const updateBlockStateOnChildren = (schema: Schema, scope: Element): Element[] => {
  const transparentSelector = makeSelectorFromSchemaMap(schema.getTransparentElements());
  const blocksSelector = makeSelectorFromSchemaMap(schema.getBlockElements());

  return Arr.filter(scope.querySelectorAll(transparentSelector), (transparent) => updateTransparent(blocksSelector, transparent));
};

const trimEdge = (el: DocumentFragment, leftSide: boolean) => {
  const childPropertyName = leftSide ? 'lastChild' : 'firstChild';

  for (let child = el[childPropertyName]; child; child = child[childPropertyName]) {
    if (Empty.isEmpty(SugarElement.fromDom(child))) {
      child.parentNode?.removeChild(child);
      return;
    }
  }
};

const split = (parentElm: Element, splitElm: Node) => {
  const range = document.createRange();
  const parentNode = parentElm.parentNode;

  if (parentNode) {
    range.setStartBefore(parentElm);
    range.setEndBefore(splitElm);
    const beforeFragment = range.extractContents();
    trimEdge(beforeFragment, true);

    range.setStartAfter(splitElm);
    range.setEndAfter(parentElm);
    const afterFragment = range.extractContents();
    trimEdge(afterFragment, false);

    if (!Empty.isEmpty(SugarElement.fromDom(beforeFragment))) {
      parentNode.insertBefore(beforeFragment, parentElm);
    }

    if (!Empty.isEmpty(SugarElement.fromDom(splitElm))) {
      parentNode.insertBefore(splitElm, parentElm);
    }

    if (!Empty.isEmpty(SugarElement.fromDom(afterFragment))) {
      parentNode.insertBefore(afterFragment, parentElm);
    }

    parentNode.removeChild(parentElm);
  }
};

// This will find invalid blocks wrapped in anchors and split them out so for example
// <h1><a href="#"><h2>x</h2></a></h1> will find that h2 is invalid inside the H1 and split that out.
// This is a simplistic apporach so it's likely not covering all the cases but it's a start.
const splitInvalidChildren = (schema: Schema, scope: Element, transparentBlocks: Element[]): void => {
  const blocksElements = schema.getBlockElements();
  const rootNode = SugarElement.fromDom(scope);
  const isBlock = (el: SugarElement): el is SugarElement<Element> => SugarNode.name(el) in blocksElements;
  const isRoot = (el: SugarElement) => Compare.eq(el, rootNode);

  Arr.each(SugarElements.fromDom(transparentBlocks), (transparentBlock) => {
    PredicateFind.ancestor(transparentBlock, isBlock, isRoot).each((parentBlock) => {
      const invalidChildren = PredicateFilter.children(
        transparentBlock,
        (el) => isBlock(el) && !schema.isValidChild(SugarNode.name(parentBlock), SugarNode.name(el))
      );

      if (invalidChildren.length > 0) {
        const stateScope = Traverse.parentElement(parentBlock);

        Arr.each(invalidChildren, (child) => {
          PredicateFind.ancestor(child, isBlock, isRoot).each((parentBlock) => {
            split(parentBlock.dom as Element, child.dom);
          });
        });

        stateScope.each((scope) => updateBlockStateOnChildren(schema, scope.dom));
      }
    });
  });
};

const unwrapInvalidChildren = (schema: Schema, scope: Element, transparentBlocks: Element[]) => {
  Arr.each([ ...transparentBlocks, ...(isTransparentBlock(schema, scope) ? [ scope ] : []) ], (block) =>
    Arr.each(SelectorFilter.descendants(SugarElement.fromDom(block), block.nodeName.toLowerCase()), (elm) => {
      if (isTransparentInline(schema, elm.dom)) {
        Remove.unwrap(elm);
      }
    })
  );
};

export const updateChildren = (schema: Schema, scope: Element): void => {
  const transparentBlocks = updateBlockStateOnChildren(schema, scope);
  splitInvalidChildren(schema, scope, transparentBlocks);
  unwrapInvalidChildren(schema, scope, transparentBlocks);
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

export const hasBlockAttr = (el: Element): boolean => el.hasAttribute(transparentBlockAttr);

export const isTransparentElementName = (schema: Schema, name: string): boolean => Obj.has(schema.getTransparentElements(), name);

const isTransparentElement = (schema: Schema, node: Node | null | undefined): node is Element =>
  NodeType.isElement(node) && isTransparentElementName(schema, node.nodeName);

export const isTransparentBlock = (schema: Schema, node: Node | null | undefined): node is Element =>
  isTransparentElement(schema, node) && hasBlockAttr(node);

export const isTransparentInline = (schema: Schema, node: Node | null | undefined): node is Element =>
  isTransparentElement(schema, node) && !hasBlockAttr(node);

export const isTransparentAstBlock = (schema: Schema, node: AstNode): boolean =>
  node.type === 1 && isTransparentElementName(schema, node.name) && Type.isString(node.attr(transparentBlockAttr));

export const isTransparentAstInline = (schema: Schema, node: AstNode): boolean =>
  node.type === 1 && isTransparentElementName(schema, node.name) && Type.isUndefined(node.attr(transparentBlockAttr));
