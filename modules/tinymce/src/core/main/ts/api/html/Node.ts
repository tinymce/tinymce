/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { SchemaMap } from './Schema';
import { Obj } from '@ephox/katamari';
import { isWhitespaceText } from '../../text/Whitespace';

export type Attributes = Array<{ name: string; value: string }> & { map: Record<string, string> };

const typeLookup = {
  '#text': 3,
  '#comment': 8,
  '#cdata': 4,
  '#pi': 7,
  '#doctype': 10,
  '#document-fragment': 11
};

// Walks the tree left/right
const walk = function (node: Node, root: Node | null, prev?: boolean): Node {
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
};

const isEmptyTextNode = (node: Node) => {
  // Non whitespace content
  if (!isWhitespaceText(node.value)) {
    return false;
  }

  // Parent is not a span and only spaces or is a span but has styles
  const parentNode = node.parent;
  if (parentNode && (parentNode.name !== 'span' || parentNode.attr('style')) && /^[ ]+$/.test(node.value)) {
    return false;
  }

  return true;
};

// Check if node contains data-bookmark attribute, name attribute, id attribute or is a named anchor
const isNonEmptyElement = (node: Node) => {
  const isNamedAnchor = node.name === 'a' && !node.attr('href') && node.attr('id');
  return (node.attr('name') || (node.attr('id') && !node.firstChild) || node.attr('data-mce-bookmark') || isNamedAnchor);
};

/**
 * This class is a minimalistic implementation of a DOM like node used by the DomParser class.
 *
 * @example
 * var node = new tinymce.html.Node('strong', 1);
 * someRoot.append(node);
 *
 * @class tinymce.html.Node
 * @version 3.4
 */

class Node {
  /**
   * Creates a node of a specific type.
   *
   * @static
   * @method create
   * @param {String} name Name of the node type to create for example "b" or "#text".
   * @param {Object} attrs Name/value collection of attributes that will be applied to elements.
   */
  public static create(name: string, attrs?: Record<string, string>): Node {
    // Create node
    const node = new Node(name, typeLookup[name] || 1);

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
  public shortEnded?: boolean;
  public parent?: Node;
  public firstChild?: Node;
  public lastChild?: Node;
  public next?: Node;
  public prev?: Node;

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
      this.attributes = [] as Attributes;
      (this.attributes as any).map = {}; // Should be considered internal
    }
  }

  /**
   * Replaces the current node with the specified one.
   *
   * @example
   * someNode.replace(someNewNode);
   *
   * @method replace
   * @param {tinymce.html.Node} node Node to replace the current node with.
   * @return {tinymce.html.Node} The old node that got replaced.
   */
  public replace(node: Node): Node {
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
   * @example
   * someNode.attr("name", "value"); // Sets an attribute
   * console.log(someNode.attr("name")); // Gets an attribute
   * someNode.attr("name", null); // Removes an attribute
   *
   * @method attr
   * @param {String} name Attribute name to set or get.
   * @param {String} value Optional value to set.
   * @return {String/tinymce.html.Node} String or undefined on a get operation or the current node on a set operation.
   */
  public attr(name: string, value: string): string | Node;
  public attr(name: Record<string, string>): Node;
  public attr(name: string): string;
  public attr(name: string | Record<string, string>, value?: string): string | Node {
    const self = this;
    let attrs: Attributes;

    if (typeof name !== 'string') {
      if (name !== undefined && name !== null) {
        Obj.each(name, (value, key) => {
          self.attr(key, value);
        });
      }

      return self;
    }

    if ((attrs = self.attributes)) {
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
  }

  /**
   * Does a shallow clones the node into a new node. It will also exclude id attributes since
   * there should only be one id per document.
   *
   * @example
   * var clonedNode = node.clone();
   *
   * @method clone
   * @return {tinymce.html.Node} New copy of the original node.
   */
  public clone(): Node {
    const self = this;
    const clone = new Node(self.name, self.type);
    let selfAttrs: Attributes;

    // Clone element attributes
    if ((selfAttrs = self.attributes)) {
      const cloneAttrs = [] as Attributes;
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
    clone.shortEnded = self.shortEnded;

    return clone;
  }

  /**
   * Wraps the node in in another node.
   *
   * @example
   * node.wrap(wrapperNode);
   *
   * @method wrap
   */
  public wrap(wrapper: Node): Node {
    const self = this;

    self.parent.insert(wrapper, self);
    wrapper.append(self);

    return self;
  }

  /**
   * Unwraps the node in other words it removes the node but keeps the children.
   *
   * @example
   * node.unwrap();
   *
   * @method unwrap
   */
  public unwrap() {
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
   * @example
   * node.remove();
   *
   * @method remove
   * @return {tinymce.html.Node} Current node that got removed.
   */
  public remove(): Node {
    const self = this, parent = self.parent, next = self.next, prev = self.prev;

    if (parent) {
      if (parent.firstChild === self) {
        parent.firstChild = next;

        if (next) {
          next.prev = null;
        }
      } else {
        prev.next = next;
      }

      if (parent.lastChild === self) {
        parent.lastChild = prev;

        if (prev) {
          prev.next = null;
        }
      } else {
        next.prev = prev;
      }

      self.parent = self.next = self.prev = null;
    }

    return self;
  }

  /**
   * Appends a new node as a child of the current node.
   *
   * @example
   * node.append(someNode);
   *
   * @method append
   * @param {tinymce.html.Node} node Node to append as a child of the current one.
   * @return {tinymce.html.Node} The node that got appended.
   */
  public append(node: Node): Node {
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
   * Inserts a node at a specific position as a child of the current node.
   *
   * @example
   * parentNode.insert(newChildNode, oldChildNode);
   *
   * @method insert
   * @param {tinymce.html.Node} node Node to insert as a child of the current node.
   * @param {tinymce.html.Node} refNode Reference node to set node before/after.
   * @param {Boolean} before Optional state to insert the node before the reference node.
   * @return {tinymce.html.Node} The node that got inserted.
   */
  public insert(node: Node, refNode: Node, before?: boolean): Node {

    if (node.parent) {
      node.remove();
    }

    const parent = refNode.parent || this;

    if (before) {
      if (refNode === parent.firstChild) {
        parent.firstChild = node;
      } else {
        refNode.prev.next = node;
      }

      node.prev = refNode.prev;
      node.next = refNode;
      refNode.prev = node;
    } else {
      if (refNode === parent.lastChild) {
        parent.lastChild = node;
      } else {
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
   * Get all children by name.
   *
   * @method getAll
   * @param {String} name Name of the child nodes to collect.
   * @return {Array} Array with child nodes matchin the specified name.
   */
  public getAll(name: string): Node[] {
    const self = this;
    const collection: Node[] = [];

    for (let node = self.firstChild; node; node = walk(node, self)) {
      if (node.name === name) {
        collection.push(node);
      }
    }

    return collection;
  }

  /**
   * Removes all children of the current node.
   *
   * @method empty
   * @return {tinymce.html.Node} The current node that got cleared.
   */
  public empty(): Node {
    const self = this;

    // Remove all children
    if (self.firstChild) {
      const nodes = [];

      // Collect the children
      for (let node = self.firstChild; node; node = walk(node, self)) {
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
   * @example
   * node.isEmpty({img: true});
   * @method isEmpty
   * @param {Object} elements Name/value object with elements that are automatically treated as non empty elements.
   * @param {Object} whitespace Name/value object with elements that are automatically treated whitespace preservables.
   * @param {function} predicate Optional predicate that gets called after the other rules determine that the node is empty. Should return true if the node is a content node.
   * @return {Boolean} true/false if the node is empty or not.
   */
  public isEmpty(elements: SchemaMap, whitespace: SchemaMap = {}, predicate?: (node: Node) => boolean) {
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
        if (node.type === 3 && node.parent && whitespace[node.parent.name] && isWhitespaceText(node.value)) {
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
  public walk(prev?: boolean): Node {
    return walk(this, null, prev);
  }
}

export default Node;
