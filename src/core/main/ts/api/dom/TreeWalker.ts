/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

/**
 * TreeWalker class enables you to walk the DOM in a linear manner.
 *
 * @class tinymce.dom.TreeWalker
 * @example
 * var walker = new tinymce.dom.TreeWalker(startNode);
 *
 * do {
 *     console.log(walker.current());
 * } while (walker.next());
 */

export default function (startNode, rootNode) {
  let node = startNode;

  const findSibling = function (node, startName, siblingName, shallow) {
    let sibling, parent;

    if (node) {
      // Walk into nodes if it has a start
      if (!shallow && node[startName]) {
        return node[startName];
      }

      // Return the sibling if it has one
      if (node !== rootNode) {
        sibling = node[siblingName];
        if (sibling) {
          return sibling;
        }

        // Walk up the parents to look for siblings
        for (parent = node.parentNode; parent && parent !== rootNode; parent = parent.parentNode) {
          sibling = parent[siblingName];
          if (sibling) {
            return sibling;
          }
        }
      }
    }
  };

  const findPreviousNode = function (node, startName, siblingName, shallow) {
    let sibling, parent, child;

    if (node) {
      sibling = node[siblingName];
      if (rootNode && sibling === rootNode) {
        return;
      }

      if (sibling) {
        if (!shallow) {
          // Walk up the parents to look for siblings
          for (child = sibling[startName]; child; child = child[startName]) {
            if (!child[startName]) {
              return child;
            }
          }
        }

        return sibling;
      }

      parent = node.parentNode;
      if (parent && parent !== rootNode) {
        return parent;
      }
    }
  };

  /**
   * Returns the current node.
   *
   * @method current
   * @return {Node} Current node where the walker is.
   */
  this.current = function () {
    return node;
  };

  /**
   * Walks to the next node in tree.
   *
   * @method next
   * @return {Node} Current node where the walker is after moving to the next node.
   */
  this.next = function (shallow) {
    node = findSibling(node, 'firstChild', 'nextSibling', shallow);
    return node;
  };

  /**
   * Walks to the previous node in tree.
   *
   * @method prev
   * @return {Node} Current node where the walker is after moving to the previous node.
   */
  this.prev = function (shallow) {
    node = findSibling(node, 'lastChild', 'previousSibling', shallow);
    return node;
  };

  this.prev2 = function (shallow) {
    node = findPreviousNode(node, 'lastChild', 'previousSibling', shallow);
    return node;
  };
}