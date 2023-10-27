import { Arr, Fun, Obj, Optionals, Strings, Type } from '@ephox/katamari';
import { Attribute, Class, ContentEditable, Css, Html, Insert, Remove, Selectors, SugarElement, SugarNode, Traverse, WindowVisualViewport } from '@ephox/sugar';

import * as TransparentElements from '../../content/TransparentElements';
import * as NodeType from '../../dom/NodeType';
import * as Position from '../../dom/Position';
import * as StyleSheetLoaderRegistry from '../../dom/StyleSheetLoaderRegistry';
import * as TrimNode from '../../dom/TrimNode';
import { isWhitespaceText, isZwsp } from '../../text/Whitespace';
import { GeomRect } from '../geom/Rect';
import Entities from '../html/Entities';
import Schema from '../html/Schema';
import Styles, { StyleMap } from '../html/Styles';
import { ForceHexColor, URLConverter } from '../OptionTypes';
import { MappedEvent } from '../util/EventDispatcher';
import Tools from '../util/Tools';
import EventUtils, { EventUtilsCallback } from './EventUtils';
import StyleSheetLoader from './StyleSheetLoader';
import DomTreeWalker from './TreeWalker';

/**
 * Utility class for various DOM manipulation and retrieval functions.
 *
 * @class tinymce.dom.DOMUtils
 * @example
 * // Add a class to an element by id in the page
 * tinymce.DOM.addClass('someid', 'someclass');
 *
 * // Add a class to an element by id inside the editor
 * tinymce.activeEditor.dom.addClass('someid', 'someclass');
 */

// Shorten names
const each = Tools.each;
const grep = Tools.grep;

const internalStyleName = 'data-mce-style';
const numericalCssMap = Tools.makeMap('fill-opacity font-weight line-height opacity orphans widows z-index zoom', ' ');

interface AttrHook {
  set (elm: Element, value: string | boolean | number | null, name: string): void;
  get (elm: Element, name: string): string | undefined;
}

interface AttrHooks {
  style: AttrHook;
  [key: string]: AttrHook;
}

export interface SetAttribEvent {
  attrElm: HTMLElement;
  attrName: string;
  attrValue: string | boolean | number | null;
}

export interface DOMUtilsSettings {
  schema: Schema;
  url_converter: URLConverter;
  url_converter_scope: any;
  ownEvents: boolean;
  keep_values: boolean;
  update_styles: boolean;
  root_element: HTMLElement | null;
  collect: boolean;
  onSetAttrib: (event: SetAttribEvent) => void;
  contentCssCors: boolean;
  referrerPolicy: ReferrerPolicy;
  force_hex_color: ForceHexColor;
}

export type Target = Node | Window;
export type RunArguments<T extends Node = Node> = string | T | Array<string | T> | null;
export type BoundEvent = [ Target, string, EventUtilsCallback<any>, any ];
type Callback<K extends string> = EventUtilsCallback<MappedEvent<HTMLElementEventMap, K>>;
type RunResult<T, R> = T extends Array<any> ? R[] : false | R;

interface DOMUtils {
  doc: Document;
  settings: Partial<DOMUtilsSettings>;
  win: Window;
  files: Record<string, boolean>;
  stdMode: boolean;
  boxModel: boolean;
  styleSheetLoader: StyleSheetLoader;
  boundEvents: BoundEvent[];
  styles: Styles;
  schema: Schema;
  events: EventUtils;
  root: Node | null;

  isBlock: {
    (node: Node | null): node is HTMLElement;
    (node: string): boolean;
  };
  clone: (node: Node, deep: boolean) => Node;
  getRoot: () => HTMLElement;
  getViewPort: (argWin?: Window) => GeomRect;
  getRect: (elm: string | HTMLElement) => GeomRect;
  getSize: (elm: string | HTMLElement) => {
    w: number;
    h: number;
  };
  getParent: {
    <K extends keyof HTMLElementTagNameMap>(node: string | Node | null, selector: K, root?: Node): HTMLElementTagNameMap[K] | null;
    <T extends Element>(node: string | Node | null, selector: string | ((node: Node) => node is T), root?: Node): T | null;
    (node: string | Node | null, selector?: string | ((node: Node) => boolean | void), root?: Node): Node | null;
  };
  getParents: {
    <K extends keyof HTMLElementTagNameMap>(elm: string | HTMLElementTagNameMap[K] | null, selector: K, root?: Node, collect?: boolean): Array<HTMLElementTagNameMap[K]>;
    <T extends Element>(node: string | Node | null, selector: string | ((node: Node) => node is T), root?: Node, collect?: boolean): T[];
    (elm: string | Node | null, selector?: string | ((node: Node) => boolean | void), root?: Node, collect?: boolean): Node[];
  };
  get: {
    <T extends Node>(elm: T): T;
    (elm: string): HTMLElement | null;
  };
  getNext: (node: Node | null, selector: string | ((node: Node) => boolean)) => Node | null;
  getPrev: (node: Node | null, selector: string | ((node: Node) => boolean)) => Node | null;
  select: {
    <K extends keyof HTMLElementTagNameMap>(selector: K, scope?: string | Node): Array<HTMLElementTagNameMap[K]>;
    <T extends HTMLElement = HTMLElement>(selector: string, scope?: string | Node): T[];
  };
  is: {
    <T extends Element>(elm: Node | Node[] | null, selector: string): elm is T;
    (elm: Node | Node[] | null, selector: string): boolean;
  };
  add: (parentElm: RunArguments, name: string | Element, attrs?: Record<string, string | boolean | number | null>, html?: string | Node | null, create?: boolean) => HTMLElement;
  create: {
    <K extends keyof HTMLElementTagNameMap>(name: K, attrs?: Record<string, string | boolean | number | null>, html?: string | Node | null): HTMLElementTagNameMap[K];
    (name: string, attrs?: Record<string, string | boolean | number | null>, html?: string | Node | null): HTMLElement;
  };
  createHTML: (name: string, attrs?: Record<string, string | null>, html?: string) => string;
  createFragment: (html?: string) => DocumentFragment;
  remove: {
    <T extends Node>(node: T | T[], keepChildren?: boolean): typeof node extends Array<any> ? T[] : T;
    <T extends Node>(node: string, keepChildren?: boolean): T | false;
  };
  getStyle: {
    (elm: Element, name: string, computed: true): string;
    (elm: string | Element | null, name: string, computed?: boolean): string | undefined;
  };
  setStyle: (elm: string | Element | Element[], name: string, value: string | number | null) => void;
  setStyles: (elm: string | Element | Element[], stylesArg: StyleMap) => void;
  removeAllAttribs: (e: RunArguments<Element>) => void;
  setAttrib: (elm: RunArguments<Element>, name: string, value: string | boolean | number | null) => void;
  setAttribs: (elm: RunArguments<Element>, attrs: Record<string, string | boolean | number | null>) => void;
  getAttrib: (elm: string | Element | null, name: string, defaultVal?: string) => string;
  getAttribs: (elm: string | Element) => NamedNodeMap | Attr[];
  getPos: (elm: string | Element, rootElm?: Node) => {
    x: number;
    y: number;
  };
  parseStyle: (cssText: string) => Record<string, string>;
  serializeStyle: (stylesArg: StyleMap, name?: string) => string;
  addStyle: (cssText: string) => void;
  loadCSS: (url: string) => void;
  hasClass: (elm: string | Element, cls: string) => boolean;
  addClass: (elm: RunArguments<Element>, cls: string) => void;
  removeClass: (elm: RunArguments<Element>, cls: string) => void;
  toggleClass: (elm: RunArguments<Element>, cls: string, state?: boolean) => void;
  show: (elm: string | Node | Node[]) => void;
  hide: (elm: string | Node | Node[]) => void;
  isHidden: (elm: string | Node) => boolean;
  uniqueId: (prefix?: string) => string;
  setHTML: (elm: RunArguments<Element>, html: string) => void;
  getOuterHTML: (elm: string | Node) => string;
  setOuterHTML: (elm: string | Node | Node[], html: string) => void;
  decode: (text: string) => string;
  encode: (text: string) => string;
  insertAfter: {
    <T extends Node>(node: T | T[], reference: string | Node): T;
    <T extends Node>(node: RunArguments<T>, reference: string | Node): RunResult<typeof node, T>;
  };
  replace: {
    <T extends Node>(newElm: Node, oldElm: T | T[], keepChildren?: boolean): T;
    <T extends Node>(newElm: Node, oldElm: RunArguments<T>, keepChildren?: boolean): false | T;
  };
  rename: {
    <K extends keyof HTMLElementTagNameMap>(elm: Element, name: K): HTMLElementTagNameMap[K];
    (elm: Element, name: string): Element;
  };
  findCommonAncestor: (a: Node, b: Node) => Node | null;
  run <R, T extends Node>(this: DOMUtils, elm: T | T[], func: (node: T) => R, scope?: any): typeof elm extends Array<any> ? R[] : R;
  run <R, T extends Node>(this: DOMUtils, elm: RunArguments<T>, func: (node: T) => R, scope?: any): RunResult<typeof elm, R>;
  isEmpty: (node: Node, elements?: Record<string, any>, options?: ({ includeZwsp?: boolean })) => boolean;
  createRng: () => Range;
  nodeIndex: (node: Node, normalized?: boolean) => number;
  split: {
    <T extends Node>(parentElm: Node, splitElm: Node, replacementElm: T): T | undefined;
    <T extends Node>(parentElm: Node, splitElm: T): T | undefined;
  };
  bind: {
    <K extends string>(target: Target, name: K, func: Callback<K>, scope?: any): Callback<K>;
    <K extends string>(target: Target[], name: K, func: Callback<K>, scope?: any): Callback<K>[];
  };
  unbind: {
    <K extends string>(target: Target, name?: K, func?: EventUtilsCallback<MappedEvent<HTMLElementEventMap, K>>): EventUtils;
    <K extends string>(target: Target[], name?: K, func?: EventUtilsCallback<MappedEvent<HTMLElementEventMap, K>>): EventUtils[];
  };
  fire: (target: Node | Window, name: string, evt?: {}) => EventUtils;
  dispatch: (target: Node | Window, name: string, evt?: {}) => EventUtils;
  getContentEditable: (node: Node) => string | null;
  getContentEditableParent: (node: Node) => string | null;
  isEditable: (node: Node | null | undefined) => boolean;
  destroy: () => void;
  isChildOf: (node: Node, parent: Node) => boolean;
  dumpRng: (r: Range) => string;
}

const legacySetAttribute = (elm: SugarElement<Element>, name: string, value: string | number | boolean | null) => {
  if (Type.isNullable(value) || value === '') {
    Attribute.remove(elm, name);
  } else {
    Attribute.set(elm, name, value);
  }
};

// Convert camel cased names back to hyphenated names
const camelCaseToHyphens = (name: string): string =>
  name.replace(/[A-Z]/g, (v) => '-' + v.toLowerCase());

const findNodeIndex = (node: Node | null, normalized?: boolean) => {
  let idx = 0;

  if (node) {
    for (let lastNodeType = node.nodeType, tempNode = node.previousSibling; tempNode; tempNode = tempNode.previousSibling) {
      const nodeType = tempNode.nodeType;

      // Normalize text nodes
      if (normalized && NodeType.isText(tempNode)) {
        if (nodeType === lastNodeType || !tempNode.data.length) {
          continue;
        }
      }
      idx++;
      lastNodeType = nodeType;
    }
  }

  return idx;
};

const updateInternalStyleAttr = (styles: Styles, elm: SugarElement<Element>) => {
  const rawValue = Attribute.get(elm, 'style');
  const value = styles.serialize(styles.parse(rawValue), SugarNode.name(elm));
  legacySetAttribute(elm, internalStyleName, value);
};

const convertStyleToString = (cssValue: string | number, cssName: string): string => {
  if (Type.isNumber(cssValue)) {
    return Obj.has(numericalCssMap, cssName) ? cssValue + '' : cssValue + 'px';
  } else {
    return cssValue;
  }
};

const applyStyle = ($elm: SugarElement<Node>, cssName: string, cssValue: string | number | null) => {
  const normalizedName = camelCaseToHyphens(cssName);
  if (Type.isNullable(cssValue) || cssValue === '') {
    Css.remove($elm, normalizedName);
  } else {
    Css.set($elm, normalizedName, convertStyleToString(cssValue, normalizedName));
  }
};

const setupAttrHooks = (styles: Styles, settings: Partial<DOMUtilsSettings>, getContext: () => any): AttrHooks => {
  const keepValues = settings.keep_values;
  const keepUrlHook: AttrHook = {
    set: (elm, value, name) => {
      const sugarElm = SugarElement.fromDom(elm);
      if (Type.isFunction(settings.url_converter) && Type.isNonNullable(value)) {
        value = settings.url_converter.call(settings.url_converter_scope || getContext(), String(value), name, elm);
      }

      const internalName = 'data-mce-' + name;
      legacySetAttribute(sugarElm, internalName, value);
      legacySetAttribute(sugarElm, name, value);
    },

    get: (elm, name) => {
      const sugarElm = SugarElement.fromDom(elm);
      return Attribute.get(sugarElm, 'data-mce-' + name) || Attribute.get(sugarElm, name);
    }
  };

  const attrHooks: AttrHooks = {
    style: {
      set: (elm, value) => {
        const sugarElm = SugarElement.fromDom(elm);

        if (keepValues) {
          legacySetAttribute(sugarElm, internalStyleName, value);
        }

        Attribute.remove(sugarElm, 'style');
        // If setting a style then delegate to the css api, otherwise
        // this will cause issues when using a content security policy
        if (Type.isString(value)) {
          Css.setAll(sugarElm, styles.parse(value));
        }
      },

      get: (elm) => {
        const sugarElm = SugarElement.fromDom(elm);
        const value = Attribute.get(sugarElm, internalStyleName) || Attribute.get(sugarElm, 'style');
        return styles.serialize(styles.parse(value), SugarNode.name(sugarElm));
      }
    }
  };

  if (keepValues) {
    attrHooks.href = attrHooks.src = keepUrlHook;
  }

  return attrHooks;
};

/**
 * Constructs a new DOMUtils instance. Consult the TinyMCE Documentation for more details on settings etc for this class.
 *
 * @private
 * @constructor
 * @method DOMUtils
 * @param {Document} doc Document reference to bind the utility class to.
 * @param {settings} settings Optional settings collection.
 */
const DOMUtils = (doc: Document, settings: Partial<DOMUtilsSettings> = {}): DOMUtils => {
  const addedStyles: Record<string, boolean> = {};
  const win = window;
  const files: Record<string, boolean> = {};
  let counter = 0;
  const stdMode = true;
  const boxModel = true;
  const styleSheetLoader = StyleSheetLoaderRegistry.instance.forElement(SugarElement.fromDom(doc), {
    contentCssCors: settings.contentCssCors,
    referrerPolicy: settings.referrerPolicy
  });
  const boundEvents: Array<[ Target, string, Callback<any>, any ]> = [];
  const schema = settings.schema ? settings.schema : Schema({});
  const styles = Styles({
    url_converter: settings.url_converter,
    url_converter_scope: settings.url_converter_scope,
    force_hex_color: settings.force_hex_color,
  }, settings.schema);

  const events = settings.ownEvents ? new EventUtils() : EventUtils.Event;
  const blockElementsMap = schema.getBlockElements();

  /**
   * Returns true/false if the specified element is a block element or not.
   *
   * @method isBlock
   * @param {Node/String} node Element/Node to check.
   * @return {Boolean} True/False state if the node is a block element or not.
   */
  const isBlock = (node: string | Node | null) => {
    if (Type.isString(node)) {
      return Obj.has(blockElementsMap, node);
    } else {
      return NodeType.isElement(node) && (Obj.has(blockElementsMap, node.nodeName) || TransparentElements.isTransparentBlock(schema, node));
    }
  };

  const get = <T extends Node | null | undefined>(elm: string | T): HTMLElement | T | null =>
    elm && doc && Type.isString(elm)
      ? doc.getElementById(elm)
      : elm as T;

  const _get = <T extends Node>(elm: string | T | null | undefined): SugarElement<T | HTMLElement> | null => {
    const value = get(elm);
    return Type.isNonNullable(value) ? SugarElement.fromDom(value) : null;
  };

  const getAttrib = (elm: string | Element | null, name: string, defaultVal: string = ''): string => {
    let value: string | undefined;

    const $elm = _get(elm);

    if (Type.isNonNullable($elm) && SugarNode.isElement($elm)) {
      const hook = attrHooks[name];

      if (hook && hook.get) {
        value = hook.get($elm.dom, name);
      } else {
        value = Attribute.get($elm, name);
      }
    }

    return Type.isNonNullable(value) ? value : defaultVal;
  };

  const getAttribs = (elm: string | Element): NamedNodeMap | Attr[] => {
    const node = get(elm);
    return Type.isNullable(node) ? [] : node.attributes;
  };

  const setAttrib = (elm: RunArguments<Element>, name: string, value: string | boolean | number | null) => {
    run(elm, (e) => {
      if (NodeType.isElement(e)) {
        const $elm = SugarElement.fromDom(e);
        const val = value === '' ? null : value;

        const originalValue = Attribute.get($elm, name);
        const hook = attrHooks[name];
        if (hook && hook.set) {
          hook.set($elm.dom, val, name);
        } else {
          legacySetAttribute($elm, name, val);
        }

        if (originalValue !== val && settings.onSetAttrib) {
          settings.onSetAttrib({
            attrElm: $elm.dom as HTMLElement, // We lie here to not break backwards compatibility
            attrName: name,
            attrValue: val
          });
        }
      }
    });
  };

  const clone = (node: Node, deep: boolean) => {
    return node.cloneNode(deep);
  };

  const getRoot = (): HTMLElement => settings.root_element || doc.body;

  const getViewPort = (argWin?: Window): GeomRect => {
    const vp = WindowVisualViewport.getBounds(argWin);

    // Returns viewport size excluding scrollbars
    return {
      x: vp.x,
      y: vp.y,
      w: vp.width,
      h: vp.height
    };
  };

  const getPos = (elm: string | Element | null, rootElm?: Node) => Position.getPos(doc.body, get(elm), rootElm);

  const setStyle = (elm: string | Element | Element[], name: string, value: string | number | null) => {
    run(elm, (e) => {
      const $elm = SugarElement.fromDom(e);
      applyStyle($elm, name, value);

      if (settings.update_styles) {
        updateInternalStyleAttr(styles, $elm);
      }
    });
  };

  const setStyles = (elm: string | Element | Element[], stylesArg: StyleMap) => {
    run(elm, (e) => {
      const $elm = SugarElement.fromDom(e);
      Obj.each(stylesArg, (v, n) => {
        applyStyle($elm, n, v);
      });

      if (settings.update_styles) {
        updateInternalStyleAttr(styles, $elm);
      }
    });
  };

  const getStyle = (elm: string | Element | null, name: string, computed?: boolean): string | undefined => {
    const $elm = get(elm);

    if (Type.isNullable($elm) || (!NodeType.isHTMLElement($elm) && !NodeType.isSVGElement($elm))) {
      return undefined;
    }

    if (computed) {
      return Css.get(SugarElement.fromDom($elm), camelCaseToHyphens(name));
    } else {
      // Camelcase it, if needed
      name = name.replace(/-(\D)/g, (a, b) => b.toUpperCase());

      if (name === 'float') {
        name = 'cssFloat';
      }

      return $elm.style ? ($elm.style as Record<string, any>)[name] : undefined;
    }
  };

  const getSize = (elm: HTMLElement | string | null): { w: number; h: number } => {
    const $elm = get(elm);

    if (!$elm) {
      return { w: 0, h: 0 };
    }

    let w = getStyle($elm, 'width');
    let h = getStyle($elm, 'height');

    // Non pixel value, then force offset/clientWidth
    if (!w || w.indexOf('px') === -1) {
      w = '0';
    }

    // Non pixel value, then force offset/clientWidth
    if (!h || h.indexOf('px') === -1) {
      h = '0';
    }

    return {
      w: parseInt(w, 10) || $elm.offsetWidth || $elm.clientWidth,
      h: parseInt(h, 10) || $elm.offsetHeight || $elm.clientHeight
    };
  };

  const getRect = (elm: string | HTMLElement): GeomRect => {
    const $elm = get(elm);
    const pos = getPos($elm);
    const size = getSize($elm);

    return {
      x: pos.x, y: pos.y,
      w: size.w, h: size.h
    };
  };

  const is = <T extends Element>(elm: Node | Node[] | null, selector: string): elm is T => {
    if (!elm) {
      return false;
    }

    const elms = Type.isArray(elm) ? elm : [ elm ];

    return Arr.exists(elms, (e) => {
      return Selectors.is<T>(SugarElement.fromDom(e), selector);
    });
  };

  const getParents = (elm: string | Node | null, selector?: string | ((node: Node) => boolean | void), root?: Node, collect?: boolean): Node[] | null => {
    const result: Node[] = [];

    let node = get(elm);
    collect = collect === undefined;

    // Default root on inline mode
    const resolvedRoot = root || (getRoot().nodeName !== 'BODY' ? getRoot().parentNode : null);

    // Wrap node name as func
    if (Type.isString(selector)) {
      if (selector === '*') {
        selector = NodeType.isElement;
      } else {
        const selectorVal = selector;
        selector = (node) => is(node, selectorVal);
      }
    }

    while (node) {
      // TODO: Remove nullable check once TINY-6599 is complete
      if (node === resolvedRoot || Type.isNullable(node.nodeType) || NodeType.isDocument(node) || NodeType.isDocumentFragment(node)) {
        break;
      }

      if (!selector || selector(node)) {
        if (collect) {
          result.push(node);
        } else {
          return [ node ];
        }
      }

      node = node.parentNode;
    }

    return collect ? result : null;
  };

  const getParent = (node: string | Node | null, selector?: string | ((node: Node) => boolean | void), root?: Node): Node | null => {
    const parents = getParents(node, selector, root, false);
    return parents && parents.length > 0 ? parents[0] : null;
  };

  const _findSib = (node: Node | null, selector: string | ((node: Node) => boolean), name: 'previousSibling' | 'nextSibling') => {
    let func = selector;

    if (node) {
      // If expression make a function of it using is
      if (Type.isString(selector)) {
        func = (node) => {
          return is(node, selector);
        };
      }

      // Loop all siblings
      for (let tempNode = node[name]; tempNode; tempNode = tempNode[name]) {
        if (Type.isFunction(func) && func(tempNode)) {
          return tempNode;
        }
      }
    }

    return null;
  };

  const getNext = (node: Node | null, selector: string | ((node: Node) => boolean)) => _findSib(node, selector, 'nextSibling');

  const getPrev = (node: Node | null, selector: string | ((node: Node) => boolean)) => _findSib(node, selector, 'previousSibling');

  const isParentNode = (node: Node): node is ParentNode =>
    Type.isFunction((node as any).querySelectorAll);

  const select = (selector: string, scope?: Node | string): Element[] => {
    const elm = get(scope) ?? settings.root_element ?? doc;
    return isParentNode(elm) ? Arr.from(elm.querySelectorAll(selector)) : [];
  };

  const run = function <R, T extends Node> (this: any, elm: RunArguments<T>, func: (node: T, i?: number) => R, scope?: any): RunResult<typeof elm, R> {
    const context = scope ?? this;

    if (Type.isArray(elm)) {
      const result: R[] = [];

      each(elm, (e, i) => {
        const node = get(e);
        if (node) {
          result.push(func.call(context, node as T, i));
        }
      });

      return result;
    } else {
      const node = get(elm);
      return !node ? false : func.call(context, node as T);
    }
  };

  const setAttribs = (elm: RunArguments<Element>, attrs: Record<string, string | boolean | number | null>) => {
    run(elm, ($elm) => {
      Obj.each(attrs, (value, name) => {
        setAttrib($elm, name, value);
      });
    });
  };

  const setHTML = (elm: RunArguments<Element>, html: string) => {
    run(elm, (e) => {
      const $elm = SugarElement.fromDom(e);
      Html.set($elm, html);
    });
  };

  const add = (parentElm: RunArguments, name: string | Element, attrs?: Record<string, string | boolean | number | null>, html?: string | Node | null, create?: boolean): HTMLElement =>
    run(parentElm, (parentElm) => {
      const newElm = Type.isString(name) ? doc.createElement(name) : name;

      if (Type.isNonNullable(attrs)) {
        setAttribs(newElm, attrs);
      }

      if (html) {
        if (!Type.isString(html) && html.nodeType) {
          newElm.appendChild(html);
        } else if (Type.isString(html)) {
          setHTML(newElm, html);
        }
      }

      return !create ? parentElm.appendChild(newElm) : newElm;
    }) as HTMLElement;

  const create = (name: string, attrs?: Record<string, string | boolean | number | null>, html?: string | Node | null): HTMLElement =>
    add(doc.createElement(name), name, attrs, html, true);

  const decode = Entities.decode;
  const encode = Entities.encodeAllRaw;

  const createHTML = (name: string, attrs?: Record<string, string | null>, html: string = ''): string => {
    let outHtml = '<' + name;

    for (const key in attrs) {
      if (Obj.hasNonNullableKey(attrs, key)) {
        outHtml += ' ' + key + '="' + encode(attrs[key]) + '"';
      }
    }

    if (Strings.isEmpty(html) && Obj.has(schema.getVoidElements(), name)) {
      return outHtml + ' />';
    } else {
      return outHtml + '>' + html + '</' + name + '>';
    }
  };

  const createFragment = (html?: string): DocumentFragment => {
    const container = doc.createElement('div');
    const frag = doc.createDocumentFragment();

    // Append the container to the fragment so as to remove it from
    // the current document context
    frag.appendChild(container);

    if (html) {
      container.innerHTML = html;
    }

    let node: Node | null;
    while ((node = container.firstChild)) {
      frag.appendChild(node);
    }

    // Remove the container now that all the children have been transferred
    frag.removeChild(container);

    return frag;
  };

  const remove = <T extends Node>(node: string | T | T[], keepChildren?: boolean): RunResult<typeof node, T> => {
    return run(node, (n) => {
      const $node = SugarElement.fromDom(n);

      if (keepChildren) {
        // Unwrap but don't keep any empty text nodes
        Arr.each(Traverse.children($node), (child) => {
          if (SugarNode.isText(child) && child.dom.length === 0) {
            Remove.remove(child);
          } else {
            Insert.before($node, child);
          }
        });
      }

      Remove.remove($node);

      return $node.dom;
    });
  };

  const removeAllAttribs = (e: RunArguments<Element>) => run(e, (e) => {
    const attrs = e.attributes;
    for (let i = attrs.length - 1; i >= 0; i--) {
      e.removeAttributeNode(attrs.item(i) as Attr);
    }
  });

  const parseStyle = (cssText: string): Record<string, string> => styles.parse(cssText);

  const serializeStyle = (stylesArg: StyleMap, name?: string) => styles.serialize(stylesArg, name);

  const addStyle = (cssText: string) => {
    // Prevent inline from loading the same styles twice
    if (self !== DOMUtils.DOM && doc === document) {
      if (addedStyles[cssText]) {
        return;
      }

      addedStyles[cssText] = true;
    }

    // Create style element if needed
    let styleElm = doc.getElementById('mceDefaultStyles') as HTMLStyleElement | null;
    if (!styleElm) {
      styleElm = doc.createElement('style');
      styleElm.id = 'mceDefaultStyles';
      styleElm.type = 'text/css';

      const head = doc.head;
      if (head.firstChild) {
        head.insertBefore(styleElm, head.firstChild);
      } else {
        head.appendChild(styleElm);
      }
    }

    // Append style data to old or new style element
    if ((styleElm as any).styleSheet) {
      (styleElm as any).styleSheet.cssText += cssText;
    } else {
      styleElm.appendChild(doc.createTextNode(cssText));
    }
  };

  const loadCSS = (urls: string) => {
    if (!urls) {
      urls = '';
    }

    Arr.each(urls.split(','), (url) => {
      files[url] = true;
      styleSheetLoader.load(url).catch(Fun.noop);
    });
  };

  const toggleClass = (elm: RunArguments<Element>, cls: string, state?: boolean) => {
    run(elm, (e) => {
      if (NodeType.isElement(e)) {
        const $elm = SugarElement.fromDom(e);
        // TINY-4520: DomQuery used to handle specifying multiple classes and the
        // formatter relies on it due to the changes made for TINY-7227
        const classes = cls.split(' ');
        Arr.each(classes, (c) => {
          if (Type.isNonNullable(state)) {
            const fn = state ? Class.add : Class.remove;
            fn($elm, c);
          } else {
            Class.toggle($elm, c);
          }
        });
      }
    });
  };

  const addClass = (elm: RunArguments<Element>, cls: string) => {
    toggleClass(elm, cls, true);
  };

  const removeClass = (elm: RunArguments<Element>, cls: string) => {
    toggleClass(elm, cls, false);
  };

  const hasClass = (elm: string | Element, cls: string) => {
    const $elm = _get(elm);
    // TINY-4520: DomQuery used to handle specifying multiple classes and the
    // formatter relies on it due to the changes made for TINY-7227
    const classes = cls.split(' ');
    return Type.isNonNullable($elm) && Arr.forall(classes, (c) => Class.has($elm, c));
  };

  const show = (elm: string | Node | Node[]) => {
    run(elm, (e) => Css.remove(SugarElement.fromDom(e), 'display'));
  };

  const hide = (elm: string | Node | Node[]) => {
    run(elm, (e) => Css.set(SugarElement.fromDom(e), 'display', 'none'));
  };

  const isHidden = (elm: string | Node): boolean => {
    const $elm = _get(elm);
    return Type.isNonNullable($elm) && Optionals.is(Css.getRaw($elm, 'display'), 'none');
  };

  const uniqueId = (prefix?: string) => (!prefix ? 'mce_' : prefix) + (counter++);

  const getOuterHTML = (elm: string | Node): string => {
    const $elm = _get(elm);

    if (Type.isNonNullable($elm)) {
      return NodeType.isElement($elm.dom) ? $elm.dom.outerHTML : Html.getOuter($elm);
    } else {
      return '';
    }
  };

  const setOuterHTML = (elm: string | Node | Node[], html: string) => {
    run(elm, ($elm) => {
      if (NodeType.isElement($elm)) {
        $elm.outerHTML = html;
      }
    });
  };

  const insertAfter = <T extends Node>(node: RunArguments<T>, reference: string | Node): RunResult<typeof node, T> => {
    const referenceNode = get(reference);

    return run(node, (node) => {
      const parent = referenceNode?.parentNode;
      const nextSibling = referenceNode?.nextSibling;

      if (parent) {
        if (nextSibling) {
          parent.insertBefore(node, nextSibling);
        } else {
          parent.appendChild(node);
        }
      }

      return node;
    });
  };

  const replace = <T extends Node>(newElm: Node, oldElm: RunArguments<T>, keepChildren?: boolean) => run<T, T>(oldElm, (elm) => {
    const replacee = Type.isArray(oldElm) ? newElm.cloneNode(true) : newElm;

    if (keepChildren) {
      each(grep(elm.childNodes), (node) => {
        replacee.appendChild(node);
      });
    }

    elm.parentNode?.replaceChild(replacee, elm);
    return elm;
  }) as T;

  const rename = <K extends keyof HTMLElementTagNameMap>(elm: Element, name: K): HTMLElementTagNameMap[K] => {
    if (elm.nodeName !== name.toUpperCase()) {
      // Rename block element
      const newElm = create(name) as HTMLElementTagNameMap[K];

      // Copy attribs to new block
      each(getAttribs(elm), (attrNode) => {
        setAttrib(newElm, attrNode.nodeName, getAttrib(elm, attrNode.nodeName));
      });

      // Replace block
      replace(newElm, elm, true);
      return newElm;
    } else {
      return elm as HTMLElementTagNameMap[K];
    }
  };

  const findCommonAncestor = (a: Node, b: Node) => {
    let ps: Node | null = a;

    while (ps) {
      let pe: Node | null = b;

      while (pe && ps !== pe) {
        pe = pe.parentNode;
      }

      if (ps === pe) {
        break;
      }

      ps = ps.parentNode;
    }

    if (!ps && a.ownerDocument) {
      return a.ownerDocument.documentElement;
    } else {
      return ps;
    }
  };

  // Check if element has a data-bookmark attribute, name attribute or is a named anchor
  const isNonEmptyElement = (node: Node) => {
    if (NodeType.isElement(node)) {
      const isNamedAnchor = node.nodeName.toLowerCase() === 'a' && !getAttrib(node, 'href') && getAttrib(node, 'id');
      if (getAttrib(node, 'name') || getAttrib(node, 'data-mce-bookmark') || isNamedAnchor) {
        return true;
      }
    }
    return false;
  };

  const isEmpty = (node: Node, elements?: Record<string, any>, options?: ({ includeZwsp?: boolean })) => {
    let brCount = 0;

    // Keep elements with data-bookmark attributes, name attributes or are named anchors
    if (isNonEmptyElement(node)) {
      return false;
    }

    const firstChild = node.firstChild;
    if (firstChild) {
      const walker = new DomTreeWalker(firstChild, node);
      const whitespaceElements = schema ? schema.getWhitespaceElements() : {};
      const nonEmptyElements = elements || (schema ? schema.getNonEmptyElements() : null);

      let tempNode: Node | null | undefined = firstChild;
      do {
        if (NodeType.isElement(tempNode)) {
          // Ignore bogus elements
          const bogusVal = tempNode.getAttribute('data-mce-bogus');
          if (bogusVal) {
            tempNode = walker.next(bogusVal === 'all');
            continue;
          }

          // Keep empty elements like <img />
          const name = tempNode.nodeName.toLowerCase();
          if (nonEmptyElements && nonEmptyElements[name]) {
            // Ignore single BR elements in blocks like <p><br /></p> or <p><span><br /></span></p>
            if (name === 'br') {
              brCount++;
              tempNode = walker.next();
              continue;
            }

            return false;
          }

          // Keep elements with data-bookmark attributes, name attributes or are named anchors
          if (isNonEmptyElement(tempNode)) {
            return false;
          }
        }

        // Keep comment nodes
        if (NodeType.isComment(tempNode)) {
          return false;
        }

        // Keep non whitespace text nodes
        if (NodeType.isText(tempNode) && !isWhitespaceText(tempNode.data) && (!options?.includeZwsp || !isZwsp(tempNode.data))) {
          return false;
        }

        // Keep whitespace preserve elements
        if (NodeType.isText(tempNode) && tempNode.parentNode && whitespaceElements[tempNode.parentNode.nodeName] && isWhitespaceText(tempNode.data)) {
          return false;
        }

        tempNode = walker.next();
      } while (tempNode);
    }

    return brCount <= 1;
  };

  const createRng = () => doc.createRange();

  const split = <T extends Node>(parentElm: Node, splitElm: T, replacementElm?: T): T | undefined => {
    let range = createRng();
    let beforeFragment: DocumentFragment;
    let afterFragment: DocumentFragment;

    if (parentElm && splitElm && parentElm.parentNode && splitElm.parentNode) {
      const parentNode = parentElm.parentNode;
      // Get before chunk
      range.setStart(parentNode, findNodeIndex(parentElm));
      range.setEnd(splitElm.parentNode, findNodeIndex(splitElm));
      beforeFragment = range.extractContents();

      // Get after chunk
      range = createRng();
      range.setStart(splitElm.parentNode, findNodeIndex(splitElm) + 1);
      range.setEnd(parentNode, findNodeIndex(parentElm) + 1);
      afterFragment = range.extractContents();

      // Insert before chunk
      parentNode.insertBefore(TrimNode.trimNode(self, beforeFragment, schema), parentElm);

      // Insert middle chunk
      if (replacementElm) {
        parentNode.insertBefore(replacementElm, parentElm);
        // pa.replaceChild(replacementElm, splitElm);
      } else {
        parentNode.insertBefore(splitElm, parentElm);
      }

      // Insert after chunk
      parentNode.insertBefore(TrimNode.trimNode(self, afterFragment, schema), parentElm);
      remove(parentElm);

      return replacementElm || splitElm;
    } else {
      return undefined;
    }
  };

  const bind = <K extends string>(target: Target | Target[], name: K, func: Callback<K>, scope?: any): Callback<K> | Callback<K>[] => {
    if (Type.isArray(target)) {
      let i = target.length;
      const rv: Callback<K>[] = [];

      while (i--) {
        rv[i] = bind(target[i], name, func, scope) as Callback<K>;
      }

      return rv;
    } else {
      // Collect all window/document events bound by editor instance
      if (settings.collect && (target === doc || target === win)) {
        boundEvents.push([ target, name, func, scope ]);
      }

      return events.bind(target, name, func, scope || self);
    }
  };

  const unbind = <K extends string>(target: Target | Target[], name: K, func: EventUtilsCallback<MappedEvent<HTMLElementEventMap, K>>): EventUtils | EventUtils[] => {
    if (Type.isArray(target)) {
      let i = target.length;
      const rv = [] as EventUtils[];

      while (i--) {
        rv[i] = unbind(target[i], name, func) as EventUtils;
      }

      return rv;
    } else {
      // Remove any bound events matching the input
      if (boundEvents.length > 0 && (target === doc || target === win)) {
        let i = boundEvents.length;

        while (i--) {
          const [ boundTarget, boundName, boundFunc ] = boundEvents[i];

          if (target === boundTarget && (!name || name === boundName) && (!func || func === boundFunc)) {
            events.unbind(boundTarget, boundName, boundFunc);
          }
        }
      }
      return events.unbind(target, name, func);
    }
  };

  const dispatch = (target: Target, name: string, evt?: {}) => events.dispatch(target, name, evt);
  const fire = (target: Target, name: string, evt?: {}) => events.dispatch(target, name, evt);

  const getContentEditable = (node: Node) => {
    if (node && NodeType.isHTMLElement(node)) {
      // Check for fake content editable
      const contentEditable = node.getAttribute('data-mce-contenteditable');
      if (contentEditable && contentEditable !== 'inherit') {
        return contentEditable;
      }

      // Check for real content editable
      return node.contentEditable !== 'inherit' ? node.contentEditable : null;
    } else {
      return null;
    }
  };

  const getContentEditableParent = (node: Node) => {
    const root = getRoot();
    let state: string | null = null;

    for (let tempNode: Node | null = node; tempNode && tempNode !== root; tempNode = tempNode.parentNode) {
      state = getContentEditable(tempNode);

      if (state !== null) {
        break;
      }
    }

    return state;
  };

  const isEditable = (node: Node | null | undefined) => {
    if (Type.isNonNullable(node)) {
      const scope = NodeType.isElement(node) ? node : node.parentElement;
      return Type.isNonNullable(scope) && NodeType.isHTMLElement(scope) && ContentEditable.isEditable(SugarElement.fromDom(scope));
    } else {
      return false;
    }
  };

  const destroy = () => {
    // Unbind all events bound to window/document by editor instance
    if (boundEvents.length > 0) {
      let i = boundEvents.length;

      while (i--) {
        const [ boundTarget, boundName, boundFunc ] = boundEvents[i];
        events.unbind(boundTarget, boundName, boundFunc);
      }
    }

    // Remove CSS files added to the dom
    Obj.each(files, (_, url) => {
      styleSheetLoader.unload(url);
      delete files[url];
    });
  };

  const isChildOf = (node: Node, parent: Node) => {
    return node === parent || parent.contains(node);
  };

  const dumpRng = (r: Range) => (
    'startContainer: ' + r.startContainer.nodeName +
    ', startOffset: ' + r.startOffset +
    ', endContainer: ' + r.endContainer.nodeName +
    ', endOffset: ' + r.endOffset
  );

  const self: DOMUtils = {
    doc,
    settings,
    win,
    files,
    stdMode,
    boxModel,
    styleSheetLoader,
    boundEvents,
    styles,
    schema,
    events,
    isBlock: isBlock as DOMUtils['isBlock'],

    root: null,

    clone,

    /**
     * Returns the root node of the document. This is normally the body but might be a DIV. Parents like getParent will not
     * go above the point of this root node.
     *
     * @method getRoot
     * @return {Element} Root element for the utility class.
     */
    getRoot,

    /**
     * Returns the viewport of the window.
     *
     * @method getViewPort
     * @param {Window} win Optional window to get viewport of.
     * @return {Object} Viewport object with fields x, y, w and h.
     */
    getViewPort,

    /**
     * Returns the rectangle for a specific element.
     *
     * @method getRect
     * @param {Element/String} elm Element object or element ID to get rectangle from.
     * @return {Object} Rectangle for specified element object with x, y, w, h fields.
     */
    getRect,

    /**
     * Returns the size dimensions of the specified element.
     *
     * @method getSize
     * @param {Element/String} elm Element object or element ID to get rectangle from.
     * @return {Object} Rectangle for specified element object with w, h fields.
     */
    getSize,

    /**
     * Returns a node by the specified selector function. This function will
     * loop through all parent nodes and call the specified function for each node.
     * If the function then returns true indicating that it has found what it was looking for, the loop execution will then end
     * and the node it found will be returned.
     *
     * @method getParent
     * @param {Node/String} node DOM node to search parents on or ID string.
     * @param {Function} selector Selection function or CSS selector to execute on each node.
     * @param {Node} root Optional root element, never go beyond this point.
     * @return {Node} DOM Node or null if it wasn't found.
     */
    getParent,

    /**
     * Returns a node list of all parents matching the specified selector function or pattern.
     * If the function then returns true indicating that it has found what it was looking for and that node will be collected.
     *
     * @method getParents
     * @param {Node/String} node DOM node to search parents on or ID string.
     * @param {Function} selector Selection function to execute on each node or CSS pattern.
     * @param {Node} root Optional root element, never go beyond this point.
     * @return {Array} Array of nodes or null if it wasn't found.
     */
    getParents: getParents as DOMUtils['getParents'],

    /**
     * Returns the specified element by ID or the input element if it isn't a string.
     *
     * @method get
     * @param {String/Element} n Element id to look for or element to just pass though.
     * @return {Element} Element matching the specified id or null if it wasn't found.
     */
    get,

    /**
     * Returns the next node that matches selector or function
     *
     * @method getNext
     * @param {Node} node Node to find siblings from.
     * @param {String/function} selector Selector CSS expression or function.
     * @return {Node} Next node item matching the selector or null if it wasn't found.
     */
    getNext,

    /**
     * Returns the previous node that matches selector or function
     *
     * @method getPrev
     * @param {Node} node Node to find siblings from.
     * @param {String/function} selector Selector CSS expression or function.
     * @return {Node} Previous node item matching the selector or null if it wasn't found.
     */
    getPrev,

    // #ifndef jquery

    /**
     * Returns a list of the elements specified by the given CSS selector. For example: `div#a1 p.test`
     *
     * @method select
     * @param {String} selector Target CSS selector.
     * @param {Object} scope Optional root element/scope element to search in.
     * @return {Array} Array with all matched elements.
     * @example
     * // Adds a class to all paragraphs in the currently active editor
     * tinymce.activeEditor.dom.addClass(tinymce.activeEditor.dom.select('p'), 'someclass');
     *
     * // Adds a class to all spans that have the test class in the currently active editor
     * tinymce.activeEditor.dom.addClass(tinymce.activeEditor.dom.select('span.test'), 'someclass')
     */
    select,

    /**
     * Returns true/false if the specified element matches the specified css pattern.
     *
     * @method is
     * @param {Node/NodeList} elm DOM node to match or an array of nodes to match.
     * @param {String} selector CSS pattern to match the element against.
     */
    is,

    // #endif

    /**
     * Adds the specified element to another element or elements.
     *
     * @method add
     * @param {String/Element/Array} parentElm Element id string, DOM node element or array of ids or elements to add to.
     * @param {String/Element} name Name of new element to add or existing element to add.
     * @param {Object} attrs Optional object collection with arguments to add to the new element(s).
     * @param {String} html Optional inner HTML contents to add for each element.
     * @param {Boolean} create Optional flag if the element should be created or added.
     * @return {Element/Array} Element that got created, or an array of created elements if multiple input elements
     * were passed in.
     * @example
     * // Adds a new paragraph to the end of the active editor
     * tinymce.activeEditor.dom.add(tinymce.activeEditor.getBody(), 'p', { title: 'my title' }, 'Some content');
     */
    add,

    /**
     * Creates a new element.
     *
     * @method create
     * @param {String} name Name of new element.
     * @param {Object} attrs Optional object name/value collection with element attributes.
     * @param {String} html Optional HTML string to set as inner HTML of the element.
     * @return {Element} HTML DOM node element that got created.
     * @example
     * // Adds an element where the caret/selection is in the active editor
     * var el = tinymce.activeEditor.dom.create('div', { id: 'test', 'class': 'myclass' }, 'some content');
     * tinymce.activeEditor.selection.setNode(el);
     */
    create,

    /**
     * Creates HTML string for element. The element will be closed unless an empty inner HTML string is passed in.
     *
     * @method createHTML
     * @param {String} name Name of new element.
     * @param {Object} attrs Optional object name/value collection with element attributes.
     * @param {String} html Optional HTML string to set as inner HTML of the element.
     * @return {String} String with new HTML element, for example: <a href="#">test</a>.
     * @example
     * // Creates a html chunk and inserts it at the current selection/caret location
     * tinymce.activeEditor.selection.setContent(tinymce.activeEditor.dom.createHTML('a', { href: 'test.html' }, 'some line'));
     */
    createHTML,

    /**
     * Creates a document fragment out of the specified HTML string.
     *
     * @method createFragment
     * @param {String} html Html string to create fragment from.
     * @return {DocumentFragment} Document fragment node.
     */
    createFragment,

    /**
     * Removes/deletes the specified element(s) from the DOM.
     *
     * @method remove
     * @param {String/Element/Array} node ID of element or DOM element object or array containing multiple elements/ids.
     * @param {Boolean} keepChildren Optional state to keep children or not. If set to true all children will be
     * placed at the location of the removed element.
     * @return {Element/Array} HTML DOM element that got removed, or an array of removed elements if multiple input elements
     * were passed in.
     * @example
     * // Removes all paragraphs in the active editor
     * tinymce.activeEditor.dom.remove(tinymce.activeEditor.dom.select('p'));
     *
     * // Removes an element by id in the document
     * tinymce.DOM.remove('mydiv');
     */
    remove,

    /**
     * Sets the CSS style value on a HTML element. The name can be a camelcase string
     * or the CSS style name like background-color.
     *
     * @method setStyle
     * @param {String/Element/Array} elm HTML element/Array of elements to set CSS style value on.
     * @param {String} name Name of the style value to set.
     * @param {String} value Value to set on the style.
     * @example
     * // Sets a style value on all paragraphs in the currently active editor
     * tinymce.activeEditor.dom.setStyle(tinymce.activeEditor.dom.select('p'), 'background-color', 'red');
     *
     * // Sets a style value to an element by id in the current document
     * tinymce.DOM.setStyle('mydiv', 'background-color', 'red');
     */
    setStyle,

    /**
     * Returns the current style or runtime/computed value of an element.
     *
     * @method getStyle
     * @param {String/Element} elm HTML element or element id string to get style from.
     * @param {String} name Style name to return.
     * @param {Boolean} computed Computed style.
     * @return {String} Current style or computed style value of an element.
     */
    getStyle: getStyle as DOMUtils['getStyle'],

    /**
     * Sets multiple styles on the specified element(s).
     *
     * @method setStyles
     * @param {Element/String/Array} elm DOM element, element id string or array of elements/ids to set styles on.
     * @param {Object} styles Name/Value collection of style items to add to the element(s).
     * @example
     * // Sets styles on all paragraphs in the currently active editor
     * tinymce.activeEditor.dom.setStyles(tinymce.activeEditor.dom.select('p'), { 'background-color': 'red', 'color': 'green' });
     *
     * // Sets styles to an element by id in the current document
     * tinymce.DOM.setStyles('mydiv', { 'background-color': 'red', 'color': 'green' });
     */
    setStyles,

    /**
     * Removes all attributes from an element or elements.
     *
     * @method removeAllAttribs
     * @param {Element/String/Array} e DOM element, element id string or array of elements/ids to remove attributes from.
     */
    removeAllAttribs,

    /**
     * Sets the specified attribute of an element or elements.
     *
     * @method setAttrib
     * @param {Element/String/Array} elm DOM element, element id string or array of elements/ids to set attribute on.
     * @param {String} name Name of attribute to set.
     * @param {String} value Value to set on the attribute - if this value is falsy like null, 0 or '' it will remove
     * the attribute instead.
     * @example
     * // Sets class attribute on all paragraphs in the active editor
     * tinymce.activeEditor.dom.setAttrib(tinymce.activeEditor.dom.select('p'), 'class', 'myclass');
     *
     * // Sets class attribute on a specific element in the current page
     * tinymce.dom.setAttrib('mydiv', 'class', 'myclass');
     */
    setAttrib,

    /**
     * Sets two or more specified attributes of an element or elements.
     *
     * @method setAttribs
     * @param {Element/String/Array} elm DOM element, element id string or array of elements/ids to set attributes on.
     * @param {Object} attrs Name/Value collection of attribute items to add to the element(s).
     * @example
     * // Sets class and title attributes on all paragraphs in the active editor
     * tinymce.activeEditor.dom.setAttribs(tinymce.activeEditor.dom.select('p'), { 'class': 'myclass', title: 'some title' });
     *
     * // Sets class and title attributes on a specific element in the current page
     * tinymce.DOM.setAttribs('mydiv', { 'class': 'myclass', title: 'some title' });
     */
    setAttribs,

    /**
     * Returns the specified attribute by name.
     *
     * @method getAttrib
     * @param {String/Element} elm Element string id or DOM element to get attribute from.
     * @param {String} name Name of attribute to get.
     * @param {String} defaultVal Optional default value to return if the attribute didn't exist.
     * @return {String} Attribute value string, default value or null if the attribute wasn't found.
     */
    getAttrib,

    /**
     * Returns the absolute x, y position of a node. The position will be returned in an object with x, y fields.
     *
     * @method getPos
     * @param {Element/String} elm HTML element or element id to get x, y position from.
     * @param {Element} rootElm Optional root element to stop calculations at.
     * @return {Object} Absolute position of the specified element object with x, y fields.
     */
    getPos,

    /**
     * Parses the specified style value into an object collection. This parser will also
     * merge and remove any redundant items that browsers might have added. It will also convert non-hex
     * colors to hex values. Urls inside the styles will also be converted to absolute/relative based on settings.
     *
     * @method parseStyle
     * @param {String} cssText Style value to parse, for example: border:1px solid red;.
     * @return {Object} Object representation of that style, for example: {border: '1px solid red'}
     */
    parseStyle,

    /**
     * Serializes the specified style object into a string.
     *
     * @method serializeStyle
     * @param {Object} styles Object to serialize as string, for example: {border: '1px solid red'}
     * @param {String} name Optional element name.
     * @return {String} String representation of the style object, for example: border: 1px solid red.
     */
    serializeStyle,

    /**
     * Adds a style element at the top of the document with the specified cssText content.
     *
     * @method addStyle
     * @param {String} cssText CSS Text style to add to top of head of document.
     */
    addStyle,

    /**
     * Imports/loads the specified CSS file into the document bound to the class.
     *
     * @method loadCSS
     * @param {String} url URL to CSS file to load.
     * @example
     * // Loads a CSS file dynamically into the current document
     * tinymce.DOM.loadCSS('somepath/some.css');
     *
     * // Loads a CSS file into the currently active editor instance
     * tinymce.activeEditor.dom.loadCSS('somepath/some.css');
     *
     * // Loads a CSS file into an editor instance by id
     * tinymce.get('someid').dom.loadCSS('somepath/some.css');
     *
     * // Loads multiple CSS files into the current document
     * tinymce.DOM.loadCSS('somepath/some.css,somepath/someother.css');
     */
    loadCSS,

    /**
     * Adds a class to the specified element or elements.
     *
     * @method addClass
     * @param {String/Element/Array} elm Element ID string or DOM element or array with elements or IDs.
     * @param {String} cls Class name to add to each element.
     * @return {String/Array} String with new class value or array with new class values for all elements.
     * @example
     * // Adds a class to all paragraphs in the active editor
     * tinymce.activeEditor.dom.addClass(tinymce.activeEditor.dom.select('p'), 'myclass');
     *
     * // Adds a class to a specific element in the current page
     * tinymce.DOM.addClass('mydiv', 'myclass');
     */
    addClass,

    /**
     * Removes a class from the specified element or elements.
     *
     * @method removeClass
     * @param {String/Element/Array} elm Element ID string or DOM element or array with elements or IDs.
     * @param {String} cls Class name to remove from each element.
     * @return {String/Array} String of remaining class name(s), or an array of strings if multiple input elements
     * were passed in.
     * @example
     * // Removes a class from all paragraphs in the active editor
     * tinymce.activeEditor.dom.removeClass(tinymce.activeEditor.dom.select('p'), 'myclass');
     *
     * // Removes a class from a specific element in the current page
     * tinymce.DOM.removeClass('mydiv', 'myclass');
     */
    removeClass,

    /**
     * Returns true if the specified element has the specified class.
     *
     * @method hasClass
     * @param {String/Element} elm HTML element or element id string to check CSS class on.
     * @param {String} cls CSS class to check for.
     * @return {Boolean} true/false if the specified element has the specified class.
     */
    hasClass,

    /**
     * Toggles the specified class on/off.
     *
     * @method toggleClass
     * @param {Element} elm Element to toggle class on.
     * @param {String} cls Class to toggle on/off.
     * @param {Boolean} state Optional state to set.
     */
    toggleClass,

    /**
     * Shows the specified element(s) by ID by setting the "display" style.
     *
     * @method show
     * @param {String/Element/Array} elm ID of DOM element or DOM element or array with elements or IDs to show.
     */
    show,

    /**
     * Hides the specified element(s) by ID by setting the "display" style.
     *
     * @method hide
     * @param {String/Element/Array} elm ID of DOM element or DOM element or array with elements or IDs to hide.
     * @example
     * // Hides an element by id in the document
     * tinymce.DOM.hide('myid');
     */
    hide,

    /**
     * Returns true/false if the element is hidden or not by checking the "display" style.
     *
     * @method isHidden
     * @param {String/Element} elm Id or element to check display state on.
     * @return {Boolean} true/false if the element is hidden or not.
     */
    isHidden,

    /**
     * Returns a unique id. This can be useful when generating elements on the fly.
     * This method will not check if the element already exists.
     *
     * @method uniqueId
     * @param {String} prefix Optional prefix to add in front of all ids - defaults to "mce_".
     * @return {String} Unique id.
     */
    uniqueId,

    /**
     * Sets the specified HTML content inside the element or elements. The HTML will first be processed. This means
     * URLs will get converted, hex color values fixed etc. Check processHTML for details.
     *
     * @method setHTML
     * @param {Element/String/Array} elm DOM element, element id string or array of elements/ids to set HTML inside of.
     * @param {String} html HTML content to set as inner HTML of the element.
     * @example
     * // Sets the inner HTML of all paragraphs in the active editor
     * tinymce.activeEditor.dom.setHTML(tinymce.activeEditor.dom.select('p'), 'some inner html');
     *
     * // Sets the inner HTML of an element by id in the document
     * tinymce.DOM.setHTML('mydiv', 'some inner html');
     */
    setHTML,

    /**
     * Returns the outer HTML of an element.
     *
     * @method getOuterHTML
     * @param {String/Element} elm Element ID or element object to get outer HTML from.
     * @return {String} Outer HTML string.
     * @example
     * tinymce.DOM.getOuterHTML(editorElement);
     * tinymce.activeEditor.getOuterHTML(tinymce.activeEditor.getBody());
     */
    getOuterHTML,

    /**
     * Sets the specified outer HTML on an element or elements.
     *
     * @method setOuterHTML
     * @param {Element/String/Array} elm DOM element, element id string or array of elements/ids to set outer HTML on.
     * @param {Object} html HTML code to set as outer value for the element.
     * @example
     * // Sets the outer HTML of all paragraphs in the active editor
     * tinymce.activeEditor.dom.setOuterHTML(tinymce.activeEditor.dom.select('p'), '<div>some html</div>');
     *
     * // Sets the outer HTML of an element by id in the document
     * tinymce.DOM.setOuterHTML('mydiv', '<div>some html</div>');
     */
    setOuterHTML,

    /**
     * Entity decodes a string. This method decodes any HTML entities, such as `&amp;aring;`.
     *
     * @method decode
     * @param {String} s String to decode entities on.
     * @return {String} Entity decoded string.
     */
    decode,

    /**
     * Entity encodes a string. This method encodes the most common entities, such as `<`, `>`, `"` and `&`.
     *
     * @method encode
     * @param {String} text String to encode with entities.
     * @return {String} Entity encoded string.
     */
    encode,

    /**
     * Inserts an element after the reference element.
     *
     * @method insertAfter
     * @param {Element} node Element to insert after the reference.
     * @param {Element/String/Array} referenceNode Reference element, element id or array of elements to insert after.
     * @return {Element/Array} Element that got added or an array with elements.
     */
    insertAfter,

    /**
     * Replaces the specified element or elements with the new element specified. The new element will
     * be cloned if multiple input elements are passed in.
     *
     * @method replace
     * @param {Element} newElm New element to replace old ones with.
     * @param {Element/String/Array} oldElm Element DOM node, element id or array of elements or ids to replace.
     * @param {Boolean} keepChildren Optional keep children state, if set to true child nodes from the old object will be added
     * to new ones.
     */
    replace,

    /**
     * Renames the specified element and keeps its attributes and children.
     *
     * @method rename
     * @param {Element} elm Element to rename.
     * @param {String} name Name of the new element.
     * @return {Element} New element or the old element if it needed renaming.
     */
    rename,

    /**
     * Find the common ancestor of two elements. This is a shorter method than using the DOM Range logic.
     *
     * @method findCommonAncestor
     * @param {Element} a Element to find common ancestor of.
     * @param {Element} b Element to find common ancestor of.
     * @return {Element} Common ancestor element of the two input elements.
     */
    findCommonAncestor,

    /**
     * Executes the specified function on the element by id or dom element node or array of elements/id.
     *
     * @method run
     * @param {String/Element/Array} elm ID or DOM element object or array with ids or elements.
     * @param {Function} func Function to execute for each item.
     * @param {Object} scope Optional scope to execute the function in.
     * @return {Object/Array} Single object, or an array of objects if multiple input elements were passed in.
     */
    run,

    /**
     * Returns a NodeList with attributes for the element.
     *
     * @method getAttribs
     * @param {HTMLElement/string} elm Element node or string id to get attributes from.
     * @return {NodeList} NodeList with attributes.
     */
    getAttribs,

    /**
     * Returns true/false if the specified node is to be considered empty or not.
     *
     * @method isEmpty
     * @param {Object} elements Optional name/value object with elements that are automatically treated as non-empty elements.
     * @return {Boolean} true/false if the node is empty or not.
     * @example
     * tinymce.DOM.isEmpty(node, { img: true });
     */
    isEmpty,

    /**
     * Creates a new DOM Range object. This will use the native DOM Range API if it's
     * available. If it's not, it will fall back to the custom TinyMCE implementation.
     *
     * @method createRng
     * @return {DOMRange} DOM Range object.
     * @example
     * const rng = tinymce.DOM.createRng();
     * alert(rng.startContainer + "," + rng.startOffset);
     */
    createRng,

    /**
     * Returns the index of the specified node within its parent.
     *
     * @method nodeIndex
     * @param {Node} node Node to look for.
     * @param {Boolean} normalized Optional true/false state if the index is what it would be after a normalization.
     * @return {Number} Index of the specified node.
     */
    nodeIndex: findNodeIndex,

    /**
     * Splits an element into two new elements and places the specified split
     * element or elements between the new ones. For example splitting the paragraph at the bold element in
     * this example `<p>abc<b>abc</b>123</p>` would produce `<p>abc</p><b>abc</b><p>123</p>`.
     *
     * @method split
     * @param {Element} parentElm Parent element to split.
     * @param {Element} splitElm Element to split at.
     * @param {Element} replacementElm Optional replacement element to replace the split element with.
     * @return {Element} Returns the split element or the replacement element if that is specified.
     */
    split,

    /**
     * Adds an event handler to the specified object.
     *
     * @method bind
     * @param {Element/Document/Window/Array} target Target element to bind events to.
     * handler to or an array of elements/ids/documents.
     * @param {String} name Name of event handler to add, for example: click.
     * @param {Function} func Function to execute when the event occurs.
     * @param {Object} scope Optional scope to execute the function in.
     * @return {Function} Function callback handler the same as the one passed in.
     */
    bind: bind as DOMUtils['bind'],

    /**
     * Removes the specified event handler by name and function from an element or collection of elements.
     *
     * @method unbind
     * @param {Element/Document/Window/Array} target Target element to unbind events on.
     * @param {String} name Event handler name, for example: "click"
     * @param {Function} func Function to remove.
     * @return {Boolean/Array} Bool state of true if the handler was removed, or an array of states if multiple input elements
     * were passed in.
     */
    unbind: unbind as DOMUtils['unbind'],

    /**
     * Fires the specified event name and optional object on the specified target.
     * <br>
     * <em>Deprecated in TinyMCE 6.0 and has been marked for removal in TinyMCE 7.0. Use <code>dispatch</code> instead.</em>
     *
     * @method fire
     * @param {Node/Document/Window} target Target element or object to fire event on.
     * @param {String} name Event name to fire.
     * @param {Object} evt Event object to send.
     * @return {Event} Event object.
     * @deprecated Use dispatch() instead
     */
    fire,

    /**
     * Dispatches the specified event name and optional object on the specified target.
     *
     * @method dispatch
     * @param {Node/Document/Window} target Target element or object to dispatch event on.
     * @param {String} name Name of the event to fire.
     * @param {Object} evt Event object to send.
     * @return {Event} Event object.
     */
    dispatch,

    // Returns the content editable state of a node
    getContentEditable,
    getContentEditableParent,

    /**
     * Checks if the specified node is editable within the given context of its parents.
     *
     * @method isEditable
     * @param {Node} node Node to check if it's editable.
     * @return {Boolean} Will be true if the node is editable and false if it's not editable.
     */
    isEditable,

    /**
     * Destroys all internal references to the DOM to solve memory leak issues.
     *
     * @method destroy
     */
    destroy,
    isChildOf,
    dumpRng
  };

  const attrHooks = setupAttrHooks(styles, settings, Fun.constant(self));

  return self;
};

/**
 * Instance of DOMUtils for the current document.
 *
 * @static
 * @property DOM
 * @type tinymce.dom.DOMUtils
 * @example
 * // Example of how to add a class to some element by id
 * tinymce.DOM.addClass('someid', 'someclass');
 */
DOMUtils.DOM = DOMUtils(document);
DOMUtils.nodeIndex = findNodeIndex;

export default DOMUtils;
