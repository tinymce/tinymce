/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj } from '@ephox/katamari';
import { NodeTypes } from '@ephox/sugar';

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
const walk = (node: AstNode, root: AstNode | null, prev?: boolean): AstNode => {
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

const isEmptyTextNode = (node: AstNode) => {
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
const isNonEmptyElement = (node: AstNode) => {
  const isNamedAnchor = node.name === 'a' && !node.attr('href') && node.attr('id');
  return (node.attr('name') || (node.attr('id') && !node.firstChild) || node.attr('data-mce-bookmark') || isNamedAnchor);
};

export interface AstNodeConstructor {
  readonly prototype: AstNode;

  new(name: string, type: number): AstNode;

  create(name: string, attrs?: Record<string, string>): AstNode;
}

interface SynthAstNodeInternals {
  isSynthetic: true;
  name: string;
  type: number;
  attributes?: Attributes;
  value?: string;
  parent?: AstNode;
  firstChild?: AstNode;
  lastChild?: AstNode;
  next?: AstNode;
  prev?: AstNode;
}

interface DomAstNodeInternals {
  isSynthetic: false;
  node: Node;
  cache: Map<Node, AstNode>;
}

type AstNodeInternals = SynthAstNodeInternals | DomAstNodeInternals;

const queryCache = (internals: DomAstNodeInternals, node: Node | undefined): AstNode | undefined =>
  node && (internals.cache.get(node) ?? new AstNode(node, internals.cache));

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

class AstNode {
  private internals: AstNodeInternals;

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

  public get name(): string {
    if (this.internals.isSynthetic === true) {
      return this.internals.name;
    } else {
      return this.internals.node.nodeName.toLowerCase();
    }
  }

  public set name(val: string) {
    if (this.internals.isSynthetic === true) {
      this.internals.name = val;
    } else {
      // not sure how to support this in the DOM
      throw new Error('Not implemented');
    }
  }

  public get type(): number {
    if (this.internals.isSynthetic === true) {
      return this.internals.type;
    } else {
      return this.internals.node.nodeType;
    }
  }

  public set type(val: number) {
    if (this.internals.isSynthetic === true) {
      this.internals.type = val;
    } else {
      // not sure how to support this in the DOM
      throw new Error('Not implemented');
    }
  }

  public get attributes(): Attributes | undefined {
    if (this.internals.isSynthetic === true) {
      return this.internals.attributes;
    } else {
      // TODO this is creating a copy but maybe it needs to be a live collection backed by the element?
      const attrs = [] as Attributes;
      (attrs as any).map = {};
      if (this.internals.node.nodeType !== Node.ELEMENT_NODE) {
        return attrs;
      }
      const elem = this.internals.node as Element;
      for (let i = 0; i < elem.attributes.length; i++) {
        const { name, value } = elem.attributes[i];
        attrs.push({ name, value });
        attrs.map[name] = value;
      }
      return attrs;
    }
  }

  public set attributes(val: Attributes | undefined) {
    if (this.internals.isSynthetic === true) {
      this.internals.attributes = val;
    } else {
      if (this.internals.node.nodeType === NodeTypes.ELEMENT) {
        const elem = this.internals.node as HTMLElement;
        // remove previous attributes
        while (elem.attributes.length > 0) {
          elem.removeAttribute(elem.attributes[0].name);
        }
        // set new attributes
        Arr.each(val, ({ name, value }) => {
          elem.setAttribute(name, value);
        });
      }
    }
  }

  public get value(): string | undefined {
    if (this.internals.isSynthetic === true) {
      return this.internals.value;
    } else {
      return this.internals.node.nodeValue;
    }
  }

  public set value(val: string | undefined) {
    if (this.internals.isSynthetic === true) {
      this.internals.value = val;
    } else {
      switch (this.internals.node.nodeType) {
        case NodeTypes.TEXT:
        case NodeTypes.COMMENT:
        case NodeTypes.CDATA_SECTION:
        case NodeTypes.PROCESSING_INSTRUCTION:
          this.internals.node.nodeValue = val;
          break;
        default:
      }
    }
  }

  public get parent(): AstNode | undefined {
    if (this.internals.isSynthetic === true) {
      return this.internals.parent;
    } else {
      return queryCache(this.internals, this.internals.node.parentNode);
    }
  }

  public set parent(val: AstNode | undefined) {
    if (this.internals.isSynthetic === true) {
      this.internals.parent = val;
    } else {
      // it is impossible to determine what this should do to the dom structure
      throw new Error('Not implemented');
    }
  }

  public get firstChild(): AstNode | undefined {
    if (this.internals.isSynthetic === true) {
      return this.internals.firstChild;
    } else {
      return queryCache(this.internals, this.internals.node.firstChild);
    }
  }

  public set firstChild(val: AstNode | undefined) {
    if (this.internals.isSynthetic === true) {
      this.internals.firstChild = val;
    } else {
      // it is impossible to determine what this should do to the dom structure
      throw new Error('Not implemented');
    }
  }

  public get lastChild(): AstNode | undefined {
    if (this.internals.isSynthetic === true) {
      return this.internals.lastChild;
    } else {
      return queryCache(this.internals, this.internals.node.lastChild);
    }
  }

  public set lastChild(val: AstNode | undefined) {
    if (this.internals.isSynthetic === true) {
      this.internals.lastChild = val;
    } else {
      // it is impossible to determine what this should do to the dom structure
      throw new Error('Not implemented');
    }
  }

  public get next(): AstNode | undefined {
    if (this.internals.isSynthetic === true) {
      return this.internals.next;
    } else {
      return queryCache(this.internals, this.internals.node.nextSibling);
    }
  }

  public set next(val: AstNode | undefined) {
    if (this.internals.isSynthetic === true) {
      this.internals.next = val;
    } else {
      // it is impossible to determine what this should do to the dom structure
      throw new Error('Not implemented');
    }
  }

  public get prev(): AstNode | undefined {
    if (this.internals.isSynthetic === true) {
      return this.internals.prev;
    } else {
      return queryCache(this.internals, this.internals.node.previousSibling);
    }
  }

  public set prev(val: AstNode | undefined) {
    if (this.internals.isSynthetic === true) {
      this.internals.prev = val;
    } else {
      // it is impossible to determine what this should do to the dom structure
      throw new Error('Not implemented');
    }
  }

  // These have no equivalent on the node AFAIK so they're kept as properties
  public shortEnded?: boolean;
  public raw?: boolean;
  public fixed?: boolean;

  /**
   * Constructs a new synthetic Node instance.
   *
   * @constructor
   * @method Node
   * @param {String} name Name of the node type.
   * @param {Number} type Numeric type representing the node.
   */
  public constructor(name: string, type: number)
  /**
   * Constructs a new backed Node instance.
   * @param node the dom node backing the AstNode
   * @param cache the cache of nodes which should be shared between all in the same AST.
   */
  public constructor(node: Node, cache?: Map<Node, AstNode>)
  public constructor(nameOrNode: string | Node, typeOrCache: any) {
    if (typeof nameOrNode === 'string') {
      this.internals = {
        isSynthetic: true,
        name: nameOrNode,
        type: typeOrCache
      };

      if (typeOrCache === 1) {
        this.internals.attributes = [] as Attributes;
        (this.internals.attributes as any).map = {}; // Should be considered internal
      }
    } else {
      this.internals = {
        isSynthetic: false,
        node: nameOrNode,
        cache: typeOrCache ?? new Map<Node, AstNode>(),
      };
      this.internals.cache.set(nameOrNode, this);
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
  public replace(node: AstNode): AstNode {
    if (this.internals.isSynthetic && node.internals.isSynthetic) {
      const self = this;

      if (node.parent) {
        node.remove();
      }

      self.insert(node, self);
      self.remove();

      return self;

    } else {
      const [ thisN, nodeN ] = AstNode.upgradeAll([ this, node ]);
      const parentN = thisN.parentNode;
      parentN.insertBefore(thisN, nodeN);
      parentN.removeChild(thisN);
      return this;
    }
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
  public attr(name: string, value: string | null): AstNode | undefined;
  public attr(name: Record<string, string | null>): AstNode | undefined;
  public attr(name: string): string | undefined;
  public attr(name: string | Record<string, string | null>, value?: string | null): string | AstNode | undefined {
    if (this.internals.isSynthetic === true) {
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
    } else {
      // attributes can only be manipulated on elements
      if (this.internals.node.nodeType !== Node.ELEMENT_NODE) {
        return undefined;
      }
      const elem = this.internals.node as Element;
      // check if we are changing multiple attributes
      if (typeof name !== 'string') {
        if (name !== undefined && name !== null) {
          Obj.each(name, (value, key) => {
            if (value === null) {
              elem.removeAttribute(key);
            } else {
              elem.setAttribute(key, value);
            }
          });
        }
        return this;
      }
      // check if we are getting or setting an attribute
      if (value !== undefined) {
        // check if setting or removing attribute
        if (value === null) {
          elem.removeAttribute(name);
        } else {
          elem.setAttribute(name, value);
        }
        return this;
      } else {
        // return attribute value
        return elem.getAttribute(name);
      }
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
  public clone(): AstNode {
    if (this.internals.isSynthetic === true) {
      const self = this;
      const clone = new AstNode(self.name, self.type);
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

    } else {
      const cloneN = this.internals.node.cloneNode(false);
      if (cloneN.nodeType === Node.ELEMENT_NODE) {
        const elem = cloneN as Element;
        elem.removeAttribute('id');
      }
      const clone = queryCache(this.internals, cloneN);
      clone.shortEnded = this.shortEnded;

      return clone;
    }
  }

  /**
   * Wraps the node in in another node.
   *
   * @example
   * node.wrap(wrapperNode);
   *
   * @method wrap
   */
  public wrap(wrapper: AstNode): AstNode {
    if (this.internals.isSynthetic && wrapper.internals.isSynthetic) {
      const self = this;

      self.parent.insert(wrapper, self);
      wrapper.append(self);

      return self;

    } else {
      const [ thisN, wrapperN ] = AstNode.upgradeAll([ this, wrapper ]);

      const parentN = thisN.parentNode;
      if (parentN) {
        parentN.insertBefore(thisN, wrapperN);
      }
      wrapperN.appendChild(thisN);

      return this;
    }
  }

  /**
   * Unwraps the node in other words it removes the node but keeps the children.
   *
   * @example
   * node.unwrap();
   *
   * @method unwrap
   */
  public unwrap(): void {
    if (this.internals.isSynthetic === true) {
      const self = this;

      for (let node = self.firstChild; node;) {
        const next = node.next;
        self.insert(node, self, true);
        node = next;
      }

      self.remove();

    } else {
      const node = this.internals.node;
      const parent = node.parentNode;
      if (parent) {
        // move children to parent
        while (node.firstChild) {
          parent.insertBefore(node, node.firstChild);
        }
        parent.removeChild(node);
      } else {
        // no parent, so just remove children
        while (node.lastChild) {
          node.removeChild(node.lastChild);
        }
      }
    }
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
  public remove(): AstNode {
    if (this.internals.isSynthetic === true) {
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

    } else {
      const node = this.internals.node;
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
      return this;
    }
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
  public append(node: AstNode): AstNode {
    if (this.internals.isSynthetic && node.internals.isSynthetic) {
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

    } else {
      const [ thisN, nodeN ] = AstNode.upgradeAll([ this, node ]);
      thisN.appendChild(nodeN);
      return node;
    }
  }

  /**
   * Inserts a node at a specific position as a child of this node.
   *
   * @example
   * parentNode.insert(newChildNode, oldChildNode);
   *
   * @method insert
   * @param {tinymce.html.Node} node Node to insert as a child of this node.
   * @param {tinymce.html.Node} refNode Reference node to set node before/after.
   * @param {Boolean} before Optional state to insert the node before the reference node.
   * @return {tinymce.html.Node} The node that got inserted.
   */
  public insert(node: AstNode, refNode: AstNode, before?: boolean): AstNode {
    if (this.internals.isSynthetic && node.internals.isSynthetic && refNode.internals.isSynthetic) {

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

    } else {
      const [ thisN, nodeN, refNodeN ] = AstNode.upgradeAll([ this, node, refNode ]);
      if (refNodeN.parentNode !== thisN) {
        // this is incorrect, should we log?
        thisN.appendChild(nodeN);
      } else {
        if (before) {
          thisN.insertBefore(refNodeN, nodeN);
        } else { // after
          if (thisN.lastChild === refNodeN) {
            // refNodeN is the last child so just append
            thisN.appendChild(nodeN);
          } else {
            // to insert after refNodeN, insert before the node after refNodeN
            thisN.insertBefore(refNodeN.nextSibling, nodeN);
          }
        }
      }
      return node;
    }
  }

  /**
   * Get all descendants by name.
   *
   * @method getAll
   * @param {String} name Name of the descendant nodes to collect.
   * @return {Array} Array with descendant nodes matching the specified name.
   */
  public getAll(name: string): AstNode[] {
    // TODO special case this to avoid creating AstNode for the entire tree
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
    if (this.internals.isSynthetic === true) {
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
    } else {
      const node = this.internals.node;
      while (node.lastChild) {
        node.removeChild(node.lastChild);
      }
      return this;
    }
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
  public walk(prev?: boolean): AstNode {
    return walk(this, null, prev);
  }

  /**
   * Upgrade the current node and all descendants. This should only be called
   * directly on a node with no parents or siblings to ensure the upgrade is complete.
   * @param doc The document
   * @param cache The node cache
   * @returns the upgraded node internals.
   */
  private upgradeDescendants(doc: Document, cache: Map<Node, AstNode>): Node {
    if (this.internals.isSynthetic === true) {
      // create DOM node
      let node: Node | undefined;
      switch (this.internals.type) {
        case NodeTypes.ELEMENT:
          const elem = doc.createElement(this.internals.name);
          // set attributes
          Arr.each(this.internals.attributes, ({ name, value }) => {
            elem.setAttribute(name, value);
          });
          node = elem;
          break;
        case NodeTypes.TEXT:
          node = doc.createTextNode(this.internals.value);
          break;
        case NodeTypes.DOCUMENT_FRAGMENT:
          node = doc.createDocumentFragment();
          break;
        case NodeTypes.CDATA_SECTION:
          node = doc.createCDATASection(this.internals.value);
          break;
        case NodeTypes.COMMENT:
          node = doc.createComment(this.internals.value);
          break;
        case NodeTypes.ATTRIBUTE: // only produced by Element.getAttribute()
        case NodeTypes.DOCUMENT: // should't be passed to parser
        case NodeTypes.DOCUMENT_TYPE: // shouldn't be passed to parser
        case NodeTypes.ENTITY: // depreciated
        case NodeTypes.ENTITY_REFERENCE: // depreciated
        case NodeTypes.NOTATION: // depreciated
        case NodeTypes.PROCESSING_INSTRUCTION: // unsure how to support target as not in synthetic node
          throw new Error('Not supported');
      }
      // add children
      switch (this.internals.type) {
        case NodeTypes.ELEMENT:
        case NodeTypes.DOCUMENT_FRAGMENT:
          let child = this.internals.firstChild;
          while (child) {
            // grab the sibling before we mutate into a DOM based ASTNode
            const next = child.next;
            node.appendChild(child.upgradeDescendants(doc, cache));
            child = next;
          }
          break;
        default:
      }
      // mutate self into DOM based ASTNode (note will temporally have incorrect parent and siblings)
      this.internals = {
        isSynthetic: false,
        node,
        cache
      };
      cache.set(node, this);
      // return node
      return node;
    } else {
      if (this.internals.node.ownerDocument !== doc) {
        throw new Error('Can not upgrade a AST node with a mismatched document');
      }
      if (this.internals.cache !== cache) {
        throw new Error('Can not upgrade a AST node with a mismatched cache');
      }
      return this.internals.node;
    }
  }

  /**
   * Upgrade a whole tree of AstNodes.
   * @param doc the document to create nodes on.
   * @param cache the cache to store mappings for nodes.
   * @returns the DOM node for the current AstNode
   */
  private upgradeTree(doc: Document, cache: Map<Node, AstNode>): Node {
    if (this.internals.isSynthetic === true) {
      // find the root
      let root: AstNode = this;
      while (root.parent) {
        root = root.parent;
      }
      // upgrade from the root down
      root.upgradeDescendants(doc, cache);
    }
    if (this.internals.isSynthetic === true) {
      // this failure can only happen when the tree is malformed
      throw new Error('Upgrade failed');
    }
    if (this.internals.node.ownerDocument !== doc) {
      throw new Error('Can not upgrade a AST node with a mismatched document');
    }
    if (this.internals.cache !== cache) {
      throw new Error('Can not upgrade a AST node with a mismatched cache');
    }
    return this.internals.node;
  }

  /**
   * Upgrade a list of AstNodes containing at least one DOM backed AstNode to all DOM backed AstNodes.
   * @param astNodes the nodes to upgrade.
   */
  private static upgradeAll(astNodes: [AstNode, AstNode, AstNode]): [Node, Node, Node]
  private static upgradeAll(astNodes: [AstNode, AstNode]): [Node, Node]
  private static upgradeAll(astNodes: AstNode[]): Node[] {
    const isDomInternals = (astni: AstNodeInternals): astni is DomAstNodeInternals => !astni.isSynthetic;
    const optDom = Arr.find(Arr.map(astNodes, (astNode) => astNode.internals), isDomInternals);
    const dom = optDom.getOrDie('Expected one of the nodes to already be upgraded.');
    const doc = dom.node.ownerDocument;
    const cache = dom.cache;
    return Arr.map(astNodes, (astNode) => astNode.upgradeTree(doc, cache));
  }
}

export default AstNode;
