import { Fun } from '@ephox/katamari';

import AstNode from '../api/html/Node';
import Schema from '../api/html/Schema';
import Tools from '../api/util/Tools';
import * as AstNodeType from './AstNodeType';
import { hasOnlyChild, isEmpty } from './ParserUtils';

const removeOrUnwrapInvalidNode = (node: AstNode, schema: Schema, originalNodeParent: AstNode | null | undefined = node.parent) => {
  if (schema.getSpecialElements()[node.name]) {
    node.empty().remove();
  } else {
    // are the children of `node` valid children of the top level parent?
    // if not, remove or unwrap them too
    const children = node.children();
    for (const childNode of children) {
      if (originalNodeParent && !schema.isValidChild(originalNodeParent.name, childNode.name)) {
        removeOrUnwrapInvalidNode(childNode, schema, originalNodeParent);
      }
    }
    node.unwrap();
  }
};

const cleanInvalidNodes = (nodes: AstNode[], schema: Schema, rootNode: AstNode, onCreate: (newNode: AstNode) => void = Fun.noop): void => {
  const textBlockElements = schema.getTextBlockElements();
  const nonEmptyElements = schema.getNonEmptyElements();
  const whitespaceElements = schema.getWhitespaceElements();
  const nonSplittableElements = Tools.makeMap('tr,td,th,tbody,thead,tfoot,table,summary');
  const fixed = new Set<AstNode>();
  const isSplittableElement = (node: AstNode) => node !== rootNode && !nonSplittableElements[node.name];

  for (let ni = 0; ni < nodes.length; ni++) {
    const node = nodes[ni];
    let parent: AstNode | null | undefined;
    let newParent: AstNode | undefined;
    let tempNode: AstNode | undefined;

    // Don't bother if it's detached from the tree
    if (!node.parent || fixed.has(node)) {
      continue;
    }

    // If the invalid element is a text block, and the text block is within a parent LI element
    // Then unwrap the first text block and convert other sibling text blocks to LI elements similar to Word/Open Office
    if (textBlockElements[node.name] && node.parent.name === 'li') {
      // Move sibling text blocks after LI element
      let sibling = node.next;
      while (sibling) {
        if (textBlockElements[sibling.name]) {
          sibling.name = 'li';
          fixed.add(sibling);
          node.parent.insert(sibling, node.parent);
        } else {
          break;
        }

        sibling = sibling.next;
      }

      // Unwrap current text block
      node.unwrap();
      continue;
    }

    // Get list of all parent nodes until we find a valid parent to stick the child into
    const parents = [ node ];
    for (parent = node.parent; parent && !schema.isValidChild(parent.name, node.name) && isSplittableElement(parent); parent = parent.parent) {
      parents.push(parent);
    }

    // Found a suitable parent
    if (parent && parents.length > 1) {
      // If the node is a valid child of the parent, then try to move it. Otherwise unwrap it
      if (!isInvalid(schema, node, parent)) {
        // Reverse the array since it makes looping easier
        parents.reverse();

        // Clone the related parent and insert that after the moved node
        newParent = parents[0].clone();
        onCreate(newParent);

        // Start cloning and moving children on the left side of the target node
        let currentNode = newParent;
        for (let i = 0; i < parents.length - 1; i++) {
          if (schema.isValidChild(currentNode.name, parents[i].name) && i > 0) {
            tempNode = parents[i].clone();
            onCreate(tempNode);
            currentNode.append(tempNode);
          } else {
            tempNode = currentNode;
          }

          for (let childNode = parents[i].firstChild; childNode && childNode !== parents[i + 1];) {
            const nextNode = childNode.next;
            tempNode.append(childNode);
            childNode = nextNode;
          }

          currentNode = tempNode;
        }

        if (!isEmpty(schema, nonEmptyElements, whitespaceElements, newParent)) {
          parent.insert(newParent, parents[0], true);
          parent.insert(node, newParent);
        } else {
          parent.insert(node, parents[0], true);
        }

        // Check if the element is empty by looking through its contents, with special treatment for <p><br /></p>
        parent = parents[0];
        if (isEmpty(schema, nonEmptyElements, whitespaceElements, parent) || hasOnlyChild(parent, 'br')) {
          parent.empty().remove();
        }
      } else {
        removeOrUnwrapInvalidNode(node, schema);
      }
    } else if (node.parent) {
      // If it's an LI try to find a UL/OL for it or wrap it
      if (node.name === 'li') {
        let sibling = node.prev;
        if (sibling && (sibling.name === 'ul' || sibling.name === 'ol')) {
          sibling.append(node);
          continue;
        }

        sibling = node.next;
        if (sibling && (sibling.name === 'ul' || sibling.name === 'ol') && sibling.firstChild) {
          sibling.insert(node, sibling.firstChild, true);
          continue;
        }

        const wrapper = new AstNode('ul', 1);
        onCreate(wrapper);
        node.wrap(wrapper);
        continue;
      }

      // Try wrapping the element in a DIV
      if (schema.isValidChild(node.parent.name, 'div') && schema.isValidChild('div', node.name)) {
        const wrapper = new AstNode('div', 1);
        onCreate(wrapper);
        node.wrap(wrapper);
      } else {
        // We failed wrapping it, remove or unwrap it
        removeOrUnwrapInvalidNode(node, schema);
      }
    }
  }
};

const hasClosest = (node: AstNode, parentName: string): boolean => {
  let tempNode: AstNode | null | undefined = node;
  while (tempNode) {
    if (tempNode.name === parentName) {
      return true;
    }
    tempNode = tempNode.parent;
  }
  return false;
};

// The `parent` parameter of `isInvalid` function represents the closest valid parent
// under which the `node` is intended to be moved.
const isInvalid = (schema: Schema, node: AstNode, parent: AstNode | null | undefined = node.parent): boolean => {
  if (!parent) {
    return false;
  }

  // Check if the node is a valid child of the parent node. If the child is
  // unknown we don't collect it since it's probably a custom element
  if (schema.children[node.name] && !schema.isValidChild(parent.name, node.name)) {
    return true;
  }

  // Anchors are a special case and cannot be nested
  if (node.name === 'a' && hasClosest(parent, 'a')) {
    return true;
  }

  // heading element is valid if it is the only one child of summary
  if (AstNodeType.isSummary(parent) && AstNodeType.isHeading(node)) {
    return !(parent?.firstChild === node && parent?.lastChild === node);
  }

  return false;
};

export { cleanInvalidNodes, isInvalid };
