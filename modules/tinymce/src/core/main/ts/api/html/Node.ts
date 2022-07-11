import { Obj, Type } from '@ephox/katamari';

import { isWhitespaceText } from '../../text/Whitespace';
import { SchemaMap } from './Schema';

export type Attributes = Array<{ name: string; value: string }> & { map: Record<string, string> };

const typeLookup: Record<string, number> = {
  '#text': 3,
  '#comment': 8,
  '#cdata': 4,
  '#pi': 7,
  '#doctype': 10,
  '#document-fragment': 11
};

// Walks the tree left/right
const walk = (node: AstNode, root: AstNode | null, prev?: boolean): AstNode | null | undefined => {
  const startName = prev ? 'lastChild' : 'firstChild';
  const siblingName = prev ? 'prev' : 'next';

  // Walk into nodes if it has a start
  if (node[startName]) {
    return node[startName];
  }

  // Return the sibling if it has one
  if (node !== root) {
    let sibling = node[siblingName];

    if (sibling) {
      return sibling;
    }

    // Walk up the parents to look for siblings
    for (let parent = node.parent; parent && parent !== root; parent = parent.parent) {
      sibling = parent[siblingName];

      if (sibling) {
        return sibling;
      }
    }
  }

  return undefined;
};

const isEmptyTextNode = (node: AstNode) => {
  const text = node.value ?? '';

  // Non whitespace content
  if (!isWhitespaceText(text)) {
    return false;
  }

  // Parent is not a span and only spaces or is a span but has styles
  const parentNode = node.parent;
  if (parentNode && (parentNode.name !== 'span' || parentNode.attr('style')) && /^[ ]+$/.test(text)) {
    return false;
  }

  return true;
};

// Check if node contains data-bookmark attribute, name attribute, id attribute or is a named anchor
const isNonEmptyElement = (node: AstNode) => {
  const isNamedAnchor = node.name === 'a' && !node.attr('href') && node.attr('id');
  return (node.attr('name') || (node.attr('id') && !node.firstChild) || node.attr('data-mce-bookmark') || isNamedAnchor);
};

export interface AstNodeConstructor {
  readonly prototype: AstNode;

  new (name: string, type: number): AstNode;

  create(name: string, attrs?: Record<string, string>): AstNode;
}

/**
 * This class is a minimalistic implementation of a DOM like node used by the DomParser class.
 *
 * @class tinymce.html.Node
 * @version 3.4
 * @example
 * const node = new tinymce.html.Node('strong', 1);
 * someRoot.append(node);
 */

class AstNode {
  /**
   * Creates a node of a specific type.
   *
   * @static
   * @method create
   * @param {String} name Name of the node type to create for example "b" or "#text".
   * @param {Object} attrs Name/value collection of attributes that will be applied to elements.
   */
  public static create(name: string, attrs?: Record<string, string>): AstNode {
    // Create node
    const node = new AstNode(name, typeLookup[name] || 1);

    // Add attributes if needed
    if (attrs) {
      Obj.each(attrs, (value, attrName) => {
        node.attr(attrName, value);
      });
    }

    return node;
  }

  public name: string;
  public type: number;
  public attributes?: Attributes;
  public value?: string;
  public parent?: AstNode | null;
  public firstChild?: AstNode | null;
  public lastChild?: AstNode | null;
  public next?: AstNode | null;
  public prev?: AstNode | null;
  public raw?: boolean;

  /**
   * Constructs a new Node instance.
   *
   * @constructor
   * @method Node
   * @param {String} name Name of the node type.
   * @param {Number} type Numeric type representing the node.
   */
  public constructor(name: string, type: number) {
    this.name = name;
    this.type = type;

    if (type === 1) {
      this.attributes = [] as unknown as Attributes;
      (this.attributes as any).map = {}; // Should be considered internal
    }
  }

  /**
   * Replaces the current node with the specified one.
   *
   * @method replace
   * @param {tinymce.html.Node} node Node to replace the current node with.
   * @return {tinymce.html.Node} The old node that got replaced.
   * @example
   * someNode.replace(someNewNode);
   */
  public replace(node: AstNode): AstNode {
    const self = this;

    if (node.parent) {
      node.remove();
    }

    self.insert(node, self);
    self.remove();

    return self;
  }

  /**
   * Gets/sets or removes an attribute by name.
   *
   * @method attr
   * @param {String} name Attribute name to set or get.
   * @param {String} value Optional value to set.
   * @return {String/tinymce.html.Node} String or undefined on a get operation or the current node on a set operation.
   * @example
   * someNode.attr('name', 'value'); // Sets an attribute
   * console.log(someNode.attr('name')); // Gets an attribute
   * someNode.attr('name', null); // Removes an attribute
   */
  public attr(name: string, value: string | null | undefined): AstNode | undefined;
  public attr(name: Record<string, string | null | undefined> | undefined): AstNode | undefined;
  public attr(name: string): string | undefined;
  public attr(name?: string | Record<string, string | null | undefined>, value?: string | null | undefined): string | AstNode | undefined {
    const self = this;

    if (!Type.isString(name)) {
      if (Type.isNonNullable(name)) {
        Obj.each(name, (value, key) => {
          self.attr(key, value);
        });
      }

      return self;
    }

    const attrs = self.attributes;
    if (attrs) {
      if (value !== undefined) {
        // Remove attribute
        if (value === null) {
          if (name in attrs.map) {
            delete attrs.map[name];

            let i = attrs.length;
            while (i--) {
              if (attrs[i].name === name) {
                attrs.splice(i, 1);
                return self;
              }
            }
          }

          return self;
        }

        // Set attribute
        if (name in attrs.map) {
          // Set attribute
          let i = attrs.length;
          while (i--) {
            if (attrs[i].name === name) {
              attrs[i].value = value;
              break;
            }
          }
        } else {
          attrs.push({ name, value });
        }

        attrs.map[name] = value;

        return self;
      }

      return attrs.map[name];
    }

    return undefined;
  }

  /**
   * Does a shallow clones the node into a new node. It will also exclude id attributes since
   * there should only be one id per document.
   *
   * @method clone
   * @return {tinymce.html.Node} New copy of the original node.
   * @example
   * const clonedNode = node.clone();
   */
  public clone(): AstNode {
    const self = this;
    const clone = new AstNode(self.name, self.type);
    const selfAttrs = self.attributes;

    // Clone element attributes
    if (selfAttrs) {
      const cloneAttrs = [] as unknown as Attributes;
      (cloneAttrs as any).map = {};

      for (let i = 0, l = selfAttrs.length; i < l; i++) {
        const selfAttr = selfAttrs[i];

        // Clone everything except id
        if (selfAttr.name !== 'id') {
          cloneAttrs[cloneAttrs.length] = { name: selfAttr.name, value: selfAttr.value };
          cloneAttrs.map[selfAttr.name] = selfAttr.value;
        }
      }

      clone.attributes = cloneAttrs;
    }

    clone.value = self.value;

    return clone;
  }

  /**
   * Wraps the node in in another node.
   *
   * @method wrap
   * @example
   * node.wrap(wrapperNode);
   */
  public wrap(wrapper: AstNode): AstNode {
    const self = this;

    if (self.parent) {
      self.parent.insert(wrapper, self);
      wrapper.append(self);
    }

    return self;
  }

  /**
   * Unwraps the node in other words it removes the node but keeps the children.
   *
   * @method unwrap
   * @example
   * node.unwrap();
   */
  public unwrap(): void {
    const self = this;

    for (let node = self.firstChild; node;) {
      const next = node.next;
      self.insert(node, self, true);
      node = next;
    }

    self.remove();
  }

  /**
   * Removes the node from it's parent.
   *
   * @method remove
   * @return {tinymce.html.Node} Current node that got removed.
   * @example
   * node.remove();
   */
  public remove(): AstNode {
    const self = this, parent = self.parent, next = self.next, prev = self.prev;

    if (parent) {
      if (parent.firstChild === self) {
        parent.firstChild = next;

        if (next) {
          next.prev = null;
        }
      } else if (prev) {
        prev.next = next;
      }

      if (parent.lastChild === self) {
        parent.lastChild = prev;

        if (prev) {
          prev.next = null;
        }
      } else if (next) {
        next.prev = prev;
      }

      self.parent = self.next = self.prev = null;
    }

    return self;
  }

  /**
   * Appends a new node as a child of the current node.
   *
   * @method append
   * @param {tinymce.html.Node} node Node to append as a child of the current one.
   * @return {tinymce.html.Node} The node that got appended.
   * @example
   * node.append(someNode);
   */
  public append(node: AstNode): AstNode {
    const self = this;

    if (node.parent) {
      node.remove();
    }

    const last = self.lastChild;
    if (last) {
      last.next = node;
      node.prev = last;
      self.lastChild = node;
    } else {
      self.lastChild = self.firstChild = node;
    }

    node.parent = self;

    return node;
  }

  /**
   * Inserts a node at a specific position as a child of this node.
   *
   * @method insert
   * @param {tinymce.html.Node} node Node to insert as a child of this node.
   * @param {tinymce.html.Node} refNode Reference node to set node before/after.
   * @param {Boolean} before Optional state to insert the node before the reference node.
   * @return {tinymce.html.Node} The node that got inserted.
   * @example
   * parentNode.insert(newChildNode, oldChildNode);
   */
  public insert(node: AstNode, refNode: AstNode, before?: boolean): AstNode {

    if (node.parent) {
      node.remove();
    }

    const parent = refNode.parent || this;

    if (before) {
      if (refNode === parent.firstChild) {
        parent.firstChild = node;
      } else if (refNode.prev) {
        refNode.prev.next = node;
      }

      node.prev = refNode.prev;
      node.next = refNode;
      refNode.prev = node;
    } else {
      if (refNode === parent.lastChild) {
        parent.lastChild = node;
      } else if (refNode.next) {
        refNode.next.prev = node;
      }

      node.next = refNode.next;
      node.prev = refNode;
      refNode.next = node;
    }

    node.parent = parent;

    return node;
  }

  /**
   * Get all descendants by name.
   *
   * @method getAll
   * @param {String} name Name of the descendant nodes to collect.
   * @return {Array} Array with descendant nodes matching the specified name.
   */
  public getAll(name: string): AstNode[] {
    const self = this;
    const collection: AstNode[] = [];

    for (let node = self.firstChild; node; node = walk(node, self)) {
      if (node.name === name) {
        collection.push(node);
      }
    }

    return collection;
  }

  /**
   * Get all children of this node.
   *
   * @method children
   * @return {Array} Array containing child nodes.
   */
  public children(): AstNode[] {
    const self = this;
    const collection: AstNode[] = [];

    for (let node = self.firstChild; node; node = node.next) {
      collection.push(node);
    }

    return collection;
  }

  /**
   * Removes all children of the current node.
   *
   * @method empty
   * @return {tinymce.html.Node} The current node that got cleared.
   */
  public empty(): AstNode {
    const self = this;

    // Remove all children
    if (self.firstChild) {
      const nodes = [];

      // Collect the children
      for (let node: AstNode | null | undefined = self.firstChild; node; node = walk(node, self)) {
        nodes.push(node);
      }

      // Remove the children
      let i = nodes.length;
      while (i--) {
        const node = nodes[i];
        node.parent = node.firstChild = node.lastChild = node.next = node.prev = null;
      }
    }

    self.firstChild = self.lastChild = null;

    return self;
  }

  /**
   * Returns true/false if the node is to be considered empty or not.
   *
   * @method isEmpty
   * @param {Object} elements Name/value object with elements that are automatically treated as non empty elements.
   * @param {Object} whitespace Name/value object with elements that are automatically treated whitespace preservables.
   * @param {Function} predicate Optional predicate that gets called after the other rules determine that the node is empty. Should return true if the node is a content node.
   * @return {Boolean} true/false if the node is empty or not.
   * @example
   * node.isEmpty({ img: true });
   */
  public isEmpty(elements: SchemaMap, whitespace: SchemaMap = {}, predicate?: (node: AstNode) => boolean): boolean {
    const self = this;
    let node = self.firstChild;

    if (isNonEmptyElement(self)) {
      return false;
    }

    if (node) {
      do {
        if (node.type === 1) {
          // Ignore bogus elements
          if (node.attr('data-mce-bogus')) {
            continue;
          }

          // Keep empty elements like <img />
          if (elements[node.name]) {
            return false;
          }

          if (isNonEmptyElement(node)) {
            return false;
          }
        }

        // Keep comments
        if (node.type === 8) {
          return false;
        }

        // Keep non whitespace text nodes
        if (node.type === 3 && !isEmptyTextNode(node)) {
          return false;
        }

        // Keep whitespace preserve elements
        if (node.type === 3 && node.parent && whitespace[node.parent.name] && isWhitespaceText(node.value ?? '')) {
          return false;
        }

        // Predicate tells that the node is contents
        if (predicate && predicate(node)) {
          return false;
        }
      } while ((node = walk(node, self)));
    }

    return true;
  }

  /**
   * Walks to the next or previous node and returns that node or null if it wasn't found.
   *
   * @method walk
   * @param {Boolean} prev Optional previous node state defaults to false.
   * @return {tinymce.html.Node} Node that is next to or previous of the current node.
   */
  public walk(prev?: boolean): AstNode | null | undefined {
    return walk(this, null, prev);
  }
}

export default AstNode;
