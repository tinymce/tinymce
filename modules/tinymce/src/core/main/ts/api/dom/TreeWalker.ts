export interface DomTreeWalkerConstructor {
  readonly prototype: DomTreeWalker;

  new (startNode: Node, rootNode: Node): DomTreeWalker;
}

/**
 * TreeWalker class enables you to walk the DOM in a linear manner.
 *
 * @class tinymce.dom.TreeWalker
 * @example
 * const walker = new tinymce.dom.TreeWalker(startNode);
 *
 * do {
 *   console.log(walker.current());
 * } while (walker.next());
 */

class DomTreeWalker {
  private readonly rootNode: Node;
  private node: Node | undefined;

  public constructor(startNode: Node, rootNode: Node) {
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
   * @return {Node | undefined} Current node where the walker is, or undefined if the walker has reached the end.
   */
  public current(): Node | undefined {
    return this.node;
  }

  /**
   * Walks to the next node in tree.
   *
   * @method next
   * @return {Node | undefined} Current node where the walker is after moving to the next node, or undefined if the walker has reached the end.
   */
  public next(shallow?: boolean): Node | undefined {
    this.node = this.findSibling(this.node, 'firstChild', 'nextSibling', shallow);
    return this.node;
  }

  /**
   * Walks to the previous node in tree.
   *
   * @method prev
   * @return {Node | undefined} Current node where the walker is after moving to the previous node, or undefined if the walker has reached the end.
   */
  public prev(shallow?: boolean): Node | undefined {
    this.node = this.findSibling(this.node, 'lastChild', 'previousSibling', shallow);
    return this.node;
  }

  public prev2(shallow?: boolean): Node | undefined {
    this.node = this.findPreviousNode(this.node, shallow);
    return this.node;
  }

  private findSibling(node: Node, startName: 'firstChild' | 'lastChild', siblingName: 'nextSibling' | 'previousSibling', shallow?: boolean): Node | undefined {
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

  private findPreviousNode(node: Node | undefined, shallow?: boolean): undefined | Node {
    let sibling: Node, parent: Node, child: Node;

    if (node) {
      sibling = node.previousSibling;
      if (this.rootNode && sibling === this.rootNode) {
        return;
      }

      if (sibling) {
        if (!shallow) {
          // Walk down to the most distant child
          for (child = sibling.lastChild; child; child = child.lastChild) {
            if (!child.lastChild) {
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

export default DomTreeWalker;
