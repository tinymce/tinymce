import { Obj, Type } from '@ephox/katamari';

import { isWhitespaceText } from '../../text/Whitespace';

import type { SchemaMap } from './Schema';

export type Attributes = Array<{ name: string; value: string }> & { map: Record<string, string> };

// DOM nodeType → AstNode name for non-element nodes
const typeToName: Record<number, string> = {
  3: '#text',
  8: '#comment',
  4: '#cdata',
  7: '#pi',
  10: '#doctype',
  11: '#document-fragment'
};

// name → DOM nodeType used when constructing new nodes
const nameToType: Record<string, number> = {
  '#text': 3,
  '#comment': 8,
  '#cdata': 4,
  '#pi': 7,
  '#doctype': 10,
  '#document-fragment': 11
};

// Module-level WeakMap so wrapper identity is stable: same DOM node → same AstNode object
const wrapperCache = new WeakMap<Node, AstNode>();

const fromDom = (node: Node): AstNode => {
  let w = wrapperCache.get(node);
  if (!w) {
    w = new AstNode(node);
  }
  return w;
};

const buildAttrs = (el: Element): Attributes => {
  const attrs = [] as unknown as Attributes;
  (attrs as any).map = {};
  const domAttrs = el.attributes;
  for (let i = 0, l = domAttrs.length; i < l; i++) {
    const a = domAttrs[i];
    attrs.push({ name: a.name, value: a.value });
    attrs.map[a.name] = a.value;
  }
  return attrs;
};

// depth-first pre-order walk: returns the next node to visit after `node` within `root`
const walk = (node: AstNode, root: AstNode | null, prev?: boolean): AstNode | null | undefined => {
  const startName = prev ? 'lastChild' : 'firstChild';
  const siblingName = prev ? 'prev' : 'next';

  if (node[startName]) {
    return node[startName];
  }

  if (node !== root) {
    let sibling = node[siblingName];
    if (sibling) {
      return sibling;
    }
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
  if (!isWhitespaceText(text)) {
    return false;
  }
  const parentNode = node.parent;
  if (parentNode && (parentNode.name !== 'span' || parentNode.attr('style')) && /^[ ]+$/.test(text)) {
    return false;
  }
  return true;
};

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
 * This class is a thin wrapper around a native DOM Node. Tree navigation
 * (firstChild, lastChild, next, prev, parent) reads directly from the DOM,
 * and all mutations (append, insert, wrap, unwrap, remove, replace) call
 * native DOM methods. Attributes are lazily built from the element's
 * attribute list and cached until the next mutation.
 *
 * @class tinymce.html.Node
 * @version 3.4
 */
class AstNode {
  // The native DOM node this wrapper covers
  public readonly dom: Node;

  // Lazy cache of the element attribute array+map; null means rebuild on next access
  private _attrsCache: Attributes | null = null;

  // Override name for DocumentFragment roots (e.g. 'body')
  private _nameOverride?: string;

  // Value override for nodes whose content has no direct DOM equivalent:
  //   - namespace element roots (math, svg) — stores sanitized innerHTML
  //   - element nodes where value was set explicitly (template content)
  private _value?: string;

  // Raw text flag: when true the Serializer writes text without HTML-escaping.
  // Used for text content inside script/style and for template innerHTML.
  // There is no DOM equivalent so it is stored on the wrapper.
  public raw?: boolean;

  // Type override: set by legacy code that converts node types (e.g. bogus element → comment).
  // Overrides dom.nodeType for type reads.
  private _typeOverride?: number;

  public static create(name: string, attrs?: Record<string, string>): AstNode {
    const node = new AstNode(name, nameToType[name] ?? 1);
    if (attrs) {
      Obj.each(attrs, (value, attrName) => {
        node.attr(attrName, value);
      });
    }
    return node;
  }

  // Wrap an existing native DOM node, reusing any already-cached wrapper
  public static fromDom(node: Node): AstNode {
    return fromDom(node);
  }

  /**
   * Constructs a new AstNode.
   *
   * Two forms are accepted:
   *   new AstNode(name: string, type: number)  — creates a fresh DOM node
   *   new AstNode(dom: Node, nameOverride?: string) — wraps an existing DOM node
   */
  public constructor(nameOrNode: string | Node, typeOrNameOverride?: number | string) {
    if (typeof nameOrNode === 'string') {
      const name = nameOrNode;
      const type = typeof typeOrNameOverride === 'number' ? typeOrNameOverride : (nameToType[name] ?? 1);

      switch (type) {
        case 3: this.dom = document.createTextNode(''); break;
        case 8: this.dom = document.createComment(''); break;
        case 11: this.dom = document.createDocumentFragment();
          if (name !== '#document-fragment') {
            this._nameOverride = name;
          }
          break;
        default: this.dom = document.createElement(name); break;
      }
    } else {
      this.dom = nameOrNode;
      if (typeof typeOrNameOverride === 'string') {
        this._nameOverride = typeOrNameOverride;
      }
    }
    wrapperCache.set(this.dom, this);
  }

  public get name(): string {
    if (this._nameOverride !== undefined) {
      return this._nameOverride;
    }
    const n = this.dom.nodeType;
    if (n === 1) {
      return (this.dom as Element).tagName.toLowerCase();
    }
    return typeToName[n] ?? this.dom.nodeName.toLowerCase();
  }

  public set name(v: string) {
    this._nameOverride = v;
  }

  public get type(): number {
    return this._typeOverride ?? this.dom.nodeType;
  }

  public set type(v: number) {
    this._typeOverride = v;
  }

  public get value(): string | undefined {
    if (this._value !== undefined) {
      return this._value;
    }
    const n = this.dom.nodeType;
    if (n === 3 || n === 8 || n === 4 || n === 7) {
      return (this.dom as CharacterData).data;
    }
    return undefined;
  }

  public set value(v: string | undefined) {
    if (this.dom.nodeType === 1) {
      // Elements have no native value; store it in _value.
      // Used for namespace element roots (math, svg) and template content.
      this._value = v;
    } else {
      const n = this.dom.nodeType;
      if (n === 3 || n === 8 || n === 4 || n === 7) {
        (this.dom as CharacterData).data = v ?? '';
      }
    }
  }

  public get parent(): AstNode | null | undefined {
    const p = this.dom.parentNode;
    return p != null ? fromDom(p) : null;
  }

  public get firstChild(): AstNode | null | undefined {
    const c = this.dom.firstChild;
    return c != null ? fromDom(c) : null;
  }

  public get lastChild(): AstNode | null | undefined {
    const c = this.dom.lastChild;
    return c != null ? fromDom(c) : null;
  }

  public get next(): AstNode | null | undefined {
    const s = this.dom.nextSibling;
    return s != null ? fromDom(s) : null;
  }

  public get prev(): AstNode | null | undefined {
    const s = this.dom.previousSibling;
    return s != null ? fromDom(s) : null;
  }

  // Lazily builds the attribute array+map from the underlying Element.
  // Invalidated (set to null) whenever attr() is called with a write value.
  public get attributes(): Attributes | undefined {
    if (this.dom.nodeType !== 1) {
      return undefined;
    }
    if (!this._attrsCache) {
      this._attrsCache = buildAttrs(this.dom as Element);
    }
    return this._attrsCache;
  }

  public replace(node: AstNode): AstNode {
    if (node.dom.parentNode) {
      node.dom.parentNode.removeChild(node.dom);
    }
    this.insert(node, this);
    this.remove();
    return this;
  }

  public attr(name: string, value: string | null | undefined): AstNode | undefined;
  public attr(name: Record<string, string | null | undefined> | undefined): AstNode | undefined;
  public attr(name: string): string | undefined;
  public attr(name?: string | Record<string, string | null | undefined>, value?: string | null): string | AstNode | undefined {
    if (!Type.isString(name)) {
      if (Type.isNonNullable(name)) {
        Obj.each(name, (v, k) => {
          this.attr(k, v);
        });
      }
      return this;
    }

    if (this.dom.nodeType !== 1) {
      return value !== undefined ? this : undefined;
    }

    const el = this.dom as Element;

    if (value !== undefined) {
      this._attrsCache = null;
      if (value === null) {
        el.removeAttribute(name);
      } else {
        el.setAttribute(name, value);
      }
      return this;
    }

    return el.getAttribute(name) ?? undefined;
  }

  public clone(): AstNode {
    const cloned = this.dom.cloneNode(false) as Node;
    if (cloned.nodeType === 1) {
      (cloned as Element).removeAttribute('id');
    }
    return new AstNode(cloned);
  }

  public wrap(wrapper: AstNode): AstNode {
    const parent = this.dom.parentNode;
    if (parent) {
      parent.insertBefore(wrapper.dom, this.dom);
      wrapper.dom.appendChild(this.dom);
    }
    return this;
  }

  public unwrap(): void {
    const parent = this.dom.parentNode;
    if (parent) {
      let child = this.dom.firstChild;
      while (child) {
        const next = child.nextSibling;
        parent.insertBefore(child, this.dom);
        child = next;
      }
      parent.removeChild(this.dom);
    }
  }

  public remove(): AstNode {
    const parent = this.dom.parentNode;
    if (parent) {
      parent.removeChild(this.dom);
    }
    return this;
  }

  public append(node: AstNode): AstNode {
    if (node.dom.parentNode) {
      node.dom.parentNode.removeChild(node.dom);
    }
    this.dom.appendChild(node.dom);
    return node;
  }

  public insert(node: AstNode, refNode: AstNode, before?: boolean): AstNode {
    if (node.dom.parentNode) {
      node.dom.parentNode.removeChild(node.dom);
    }
    const parent = refNode.dom.parentNode ?? this.dom;
    if (before) {
      parent.insertBefore(node.dom, refNode.dom);
    } else {
      const nextSibling = refNode.dom.nextSibling;
      if (nextSibling) {
        parent.insertBefore(node.dom, nextSibling);
      } else {
        parent.appendChild(node.dom);
      }
    }
    return node;
  }

  public getAll(name: string): AstNode[] {
    const collection: AstNode[] = [];
    for (let node: AstNode | null | undefined = this.firstChild; node; node = walk(node, this)) {
      if (node.name === name) {
        collection.push(node);
      }
    }
    return collection;
  }

  public children(): AstNode[] {
    const collection: AstNode[] = [];
    for (let node = this.firstChild; node; node = node.next) {
      collection.push(node);
    }
    return collection;
  }

  public empty(): AstNode {
    while (this.dom.lastChild) {
      this.dom.removeChild(this.dom.lastChild);
    }
    return this;
  }

  public isEmpty(elements: SchemaMap, whitespace: SchemaMap = {}, predicate?: (node: AstNode) => boolean): boolean {
    const self = this;
    let node = self.firstChild;

    if (isNonEmptyElement(self)) {
      return false;
    }

    if (node) {
      do {
        if (node.type === 1) {
          if (node.attr('data-mce-bogus')) {
            continue;
          }
          if (elements[node.name]) {
            return false;
          }
          if (isNonEmptyElement(node)) {
            return false;
          }
        }

        if (node.type === 8) {
          return false;
        }

        if (node.type === 3 && !isEmptyTextNode(node)) {
          return false;
        }

        if (node.type === 3 && node.parent && whitespace[node.parent.name] && isWhitespaceText(node.value ?? '')) {
          return false;
        }

        if (predicate && predicate(node)) {
          return false;
        }
      } while ((node = walk(node, self)));
    }

    return true;
  }

  public walk(prev?: boolean): AstNode | null | undefined {
    return walk(this, null, prev);
  }
}

export default AstNode;
