/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node } from '@ephox/dom-globals';

export interface TreeWalkerConstructor {
  readonly prototype: TreeWalker;

  new (startNode: Node, rootNode: Node): TreeWalker;
}

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

class TreeWalker {
  private readonly rootNode: Node;
  private node: Node;

  constructor (startNode: Node, rootNode: Node) {
    this.node = startNode;
    this.rootNode = rootNode;

    // This is a bit hacky but needed to ensure the 'this' variable
    // always references the instance and not the caller scope
    this.current = this.current.bind(this);
    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);
    this.prev2 = this.prev2.bind(this);
  }

  /**
   * Returns the current node.
   *
   * @method current
   * @return {Node} Current node where the walker is.
   */
  public current (): Node {
    return this.node;
  }

  /**
   * Walks to the next node in tree.
   *
   * @method next
   * @return {Node} Current node where the walker is after moving to the next node.
   */
  public next (shallow?: boolean): Node {
    this.node = this.findSibling(this.node, 'firstChild', 'nextSibling', shallow);
    return this.node;
  }

  /**
   * Walks to the previous node in tree.
   *
   * @method prev
   * @return {Node} Current node where the walker is after moving to the previous node.
   */
  public prev (shallow?: boolean): Node {
    this.node = this.findSibling(this.node, 'lastChild', 'previousSibling', shallow);
    return this.node;
  }

  public prev2 (shallow?: boolean): Node {
    this.node = this.findPreviousNode(this.node, 'lastChild', 'previousSibling', shallow);
    return this.node;
  }

  private findSibling (node: Node, startName: 'firstChild' | 'lastChild', siblingName: 'nextSibling' | 'previousSibling', shallow?: boolean) {
    let sibling: Node, parent: Node;

    if (node) {
      // Walk into nodes if it has a start
      if (!shallow && node[startName]) {
        return node[startName];
      }

      // Return the sibling if it has one
      if (node !== this.rootNode) {
        sibling = node[siblingName];
        if (sibling) {
          return sibling;
        }

        // Walk up the parents to look for siblings
        for (parent = node.parentNode; parent && parent !== this.rootNode; parent = parent.parentNode) {
          sibling = parent[siblingName];
          if (sibling) {
            return sibling;
          }
        }
      }
    }
  }

  private findPreviousNode (node: Node, startName: 'lastChild', siblingName: 'previousSibling', shallow?: boolean) {
    let sibling: Node, parent: Node, child: Node;

    if (node) {
      sibling = node[siblingName];
      if (this.rootNode && sibling === this.rootNode) {
        return;
      }

      if (sibling) {
        if (!shallow) {
          // Walk down to the most distant child
          for (child = sibling[startName]; child; child = child[startName]) {
            if (!child[startName]) {
              return child;
            }
          }
        }

        return sibling;
      }

      parent = node.parentNode;
      if (parent && parent !== this.rootNode) {
        return parent;
      }
    }
  }
}

export default TreeWalker;