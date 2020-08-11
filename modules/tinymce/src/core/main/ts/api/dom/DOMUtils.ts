/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  Attr, Document, document, DocumentFragment, Element, HTMLElement, HTMLElementEventMap, HTMLElementTagNameMap, NamedNodeMap, Node, Range,
  Window, window
} from '@ephox/dom-globals';
import { Type } from '@ephox/katamari';
import { VisualViewport, Element as SugarElement } from '@ephox/sugar';
import * as NodeType from '../../dom/NodeType';
import * as Position from '../../dom/Position';
import * as TrimNode from '../../dom/TrimNode';
import Env from '../Env';
import { GeomRect } from '../geom/Rect';
import Entities from '../html/Entities';
import Schema from '../html/Schema';
import Styles, { StyleMap } from '../html/Styles';
import { ReferrerPolicy, URLConverter } from '../SettingsTypes';
import Tools from '../util/Tools';
import DomQuery, { DomQueryConstructor } from './DomQuery';
import EventUtils, { EventUtilsCallback } from './EventUtils';
import Sizzle from './Sizzle';
import { StyleSheetLoader } from './StyleSheetLoader';
import TreeWalker from './TreeWalker';
import * as StyleSheetLoaderRegistry from '../../dom/StyleSheetLoaderRegistry';
import { isWhitespaceText } from '../../text/Whitespace';

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
const isIE = Env.ie;
const simpleSelectorRe = /^([a-z0-9],?)+$/i;

interface AttrHooks {
  style: {
    set ($elm: DomQuery, value: string | {} | null): void;
    get ($elm: DomQuery): string;
  };
  href?: {
    set ($elm: DomQuery, value: string | null, name: string): void;
    get ($elm: DomQuery, name: string): string;
  };
  src?: {
    set ($elm: DomQuery, value: string | null, name: string): void;
    get ($elm: DomQuery, name: string): string;
  };
  [key: string]: {
    set ($elm: DomQuery, value: string | {} | null, name: string): void;
    get: ($elm: DomQuery, name: string) => string;
  };
}

const setupAttrHooks = function (styles: Styles, settings: Partial<DOMUtilsSettings>, getContext): AttrHooks {
  const keepValues: boolean = settings.keep_values;
  const keepUrlHook = {
    set($elm, value: string, name: string) {
      if (settings.url_converter) {
        value = settings.url_converter.call(settings.url_converter_scope || getContext(), value, name, $elm[0]);
      }

      $elm.attr('data-mce-' + name, value).attr(name, value);
    },

    get($elm, name: string) {
      return $elm.attr('data-mce-' + name) || $elm.attr(name);
    }
  };

  const attrHooks: AttrHooks = {
    style: {
      set($elm, value: string | {}) {
        if (value !== null && typeof value === 'object') {
          $elm.css(value);
          return;
        }

        if (keepValues) {
          $elm.attr('data-mce-style', value as string);
        }

        // If setting a style then delegate to the css api, otherwise
        // this will cause issues when using a content security policy
        if (value !== null && typeof value === 'string') {
          $elm.removeAttr('style');
          $elm.css(styles.parse(value));
        } else {
          $elm.attr('style', value as null);
        }
      },

      get($elm) {
        let value = $elm.attr('data-mce-style') || $elm.attr('style');

        value = styles.serialize(styles.parse(value), $elm[0].nodeName);

        return value;
      }
    }
  };

  if (keepValues) {
    attrHooks.href = attrHooks.src = keepUrlHook;
  }

  return attrHooks;
};

const updateInternalStyleAttr = function (styles: Styles, $elm) {
  const rawValue = $elm.attr('style');

  let value = styles.serialize(styles.parse(rawValue), $elm[0].nodeName);

  if (!value) {
    value = null;
  }

  $elm.attr('data-mce-style', value);
};

const findNodeIndex = function (node: Node, normalized?: boolean) {
  let idx = 0, lastNodeType, nodeType;

  if (node) {
    for (lastNodeType = node.nodeType, node = node.previousSibling; node; node = node.previousSibling) {
      nodeType = node.nodeType;

      // Normalize text nodes
      if (normalized && nodeType === 3) {
        if (nodeType === lastNodeType || !node.nodeValue.length) {
          continue;
        }
      }
      idx++;
      lastNodeType = nodeType;
    }
  }

  return idx;
};

export interface DOMUtilsSettings {
  schema: Schema;
  url_converter: URLConverter;
  url_converter_scope: {};
  ownEvents: boolean;
  proxy: any;
  keep_values: boolean;
  hex_colors: boolean;
  update_styles: boolean;
  root_element: HTMLElement;
  collect: Function;
  onSetAttrib: Function;
  contentCssCors: boolean;
  referrerPolicy: ReferrerPolicy;
}

export type Target = Node | Window | Array<Node | Window>;
export type RunArguments = string | Node | Array<string | Node>;

interface DOMUtils {
  doc: Document;
  settings: Partial<DOMUtilsSettings>;
  win: Window;
  files: {};
  stdMode: boolean;
  boxModel: boolean;
  styleSheetLoader: StyleSheetLoader;
  boundEvents: any[];
  styles: Styles;
  schema: Schema;
  events: EventUtils;
  root: Node;
  $: DomQueryConstructor;

  $$ <T extends Node>(elm: T | T[] | DomQuery<T>): DomQuery<T>;
  $$ (elm: string): DomQuery<Node>;
  isBlock (node: string | Node): boolean;
  clone (node: Node, deep: boolean): Node;
  getRoot (): HTMLElement;
  getViewPort (argWin?: Window): GeomRect;
  getRect (elm: string | HTMLElement): GeomRect;
  getSize (elm: string | HTMLElement): {
    w: number;
    h: number;
  };
  getParent (node: string | Node, selector?: string | ((node: HTMLElement) => boolean | void), root?: Node): Element;
  getParents (elm: string | Node, selector?: string | ((node: HTMLElement) => boolean | void), root?: Node, collect?: boolean): Element[];
  get (elm: string | Node): HTMLElement;
  getNext (node: Node, selector: string | ((node: Node) => boolean)): Node;
  getPrev (node: Node, selector: string | ((node: Node) => boolean)): Node;
  select <K extends keyof HTMLElementTagNameMap>(selector: K, scope?: string | Node): Array<HTMLElementTagNameMap[K]>;
  select (selector: string, scope?: string | Node): HTMLElement[];
  is (elm: Node | Node[], selector: string): boolean;
  add (parentElm: RunArguments, name: string | Node, attrs?: Record<string, string | boolean | number>, html?: string | Node, create?: boolean): HTMLElement;
  create (name: string, attrs?: Record<string, string | boolean | number>, html?: string | Node): HTMLElement;
  createHTML (name: string, attrs?: Record<string, string>, html?: string): string;
  createFragment (html?: string): DocumentFragment;
  remove (node: string | Node | Node[], keepChildren?: boolean): any;
  setStyle (elm: string | Node, name: string, value: string | number | null): void;
  setStyle (elm: string | Node, styles: StyleMap): void;
  getStyle (elm: string | Node, name: string, computed?: boolean): string;
  setStyles (elm: string | Node, stylesArg: StyleMap): void;
  removeAllAttribs (e: RunArguments): any;
  setAttrib (elm: string | Node, name: string, value: string | boolean | number | null): void;
  setAttribs (elm: string | Node, attrs: Record<string, string | boolean | number | null>): void;
  getAttrib (elm: string | Node, name: string, defaultVal?: string): string;
  getPos (elm: string | Node, rootElm?: Node): {
    x: number;
    y: number;
  };
  parseStyle (cssText: string): Record<string, string>;
  serializeStyle (stylesArg: StyleMap, name?: string): string;
  addStyle (cssText: string): void;
  loadCSS (url: string): void;
  addClass (elm: string | Node | Node[], cls: string): void;
  removeClass (elm: string | Node | Node[], cls: string): void;
  hasClass (elm: string | Node, cls: string): any;
  toggleClass (elm: string | Node | Node[], cls: string, state?: boolean): void;
  show (elm: string | Node): void;
  hide (elm: string | Node): void;
  isHidden (elm: string | Node): boolean;
  uniqueId (prefix?: string): string;
  setHTML (elm: string | Node, html: string): void;
  getOuterHTML (elm: string | Node): string;
  setOuterHTML (elm: string | Node, html: string): void;
  decode (text: string): string;
  encode (text: string): string;
  insertAfter (node: RunArguments, reference: string | Node): any;
  replace (newElm: Node, oldElm: RunArguments, keepChildren?: boolean): any;
  rename (elm: Node, name: string): Node;
  findCommonAncestor (a: Node, b: Node): Node;
  toHex (rgbVal: string): string;
  run (elm: RunArguments, func: (node: Element) => any, scope?: any): any;
  getAttribs (elm: string | Node): NamedNodeMap | Attr[];
  isEmpty (node: Node, elements?: Record<string, any>): boolean;
  createRng (): Range;
  nodeIndex (node: Node, normalized?: boolean): number;
  split <T extends Node>(parentElm: Node, splitElm: Node, replacementElm: T): T;
  split <T extends Node>(parentElm: Node, splitElm: T): T;
  bind <K extends keyof HTMLElementEventMap>(target: Target, name: K, func: EventUtilsCallback<HTMLElementEventMap[K]>, scope?: {}): any;
  bind <T = any>(target: Target, name: string, func: EventUtilsCallback<T>, scope?: {}): any;
  unbind <K extends keyof HTMLElementEventMap>(target: Target, name: K, func: EventUtilsCallback<HTMLElementEventMap[K]>): any;
  unbind <T = any>(target: Target, name?: string, func?: EventUtilsCallback<T>): any;
  fire (target: Target, name: string, evt?: {}): EventUtils;
  getContentEditable (node: Node): string;
  getContentEditableParent (node: Node): any;
  destroy (): void;
  isChildOf (node: Node, parent: Node): boolean;
  dumpRng (r: Range): string;
}

/**
 * Constructs a new DOMUtils instance. Consult the TinyMCE Documentation for more details on settings etc for this class.
 *
 * @constructor
 * @method DOMUtils
 * @param {Document} doc Document reference to bind the utility class to.
 * @param {settings} settings Optional settings collection.
 */
function DOMUtils(doc: Document, settings: Partial<DOMUtilsSettings> = {}): DOMUtils {
  const addedStyles = {};

  const win = window;
  const files = {};
  let counter = 0;
  const stdMode = true;
  const boxModel = true;
  const styleSheetLoader = StyleSheetLoaderRegistry.instance.forElement(SugarElement.fromDom(doc), {
    contentCssCors: settings.contentCssCors,
    referrerPolicy: settings.referrerPolicy
  });
  const boundEvents = [];
  const schema = settings.schema ? settings.schema : Schema({});
  const styles = Styles({
    url_converter: settings.url_converter,
    url_converter_scope: settings.url_converter_scope
  }, settings.schema);

  const events = settings.ownEvents ? new EventUtils() : EventUtils.Event;
  const blockElementsMap = schema.getBlockElements();

  const $ = DomQuery.overrideDefaults(function () {
    return {
      context: doc,
      element: self.getRoot()
    };
  });

  /**
   * Returns true/false if the specified element is a block element or not.
   *
   * @method isBlock
   * @param {Node/String} node Element/Node to check.
   * @return {Boolean} True/False state if the node is a block element or not.
   */
  const isBlock = (node: string | Node) => {
    if (typeof node === 'string') {
      return !!blockElementsMap[node];
    } else if (node) {
      // This function is called in module pattern style since it might be executed with the wrong this scope
      const type = node.nodeType;

      // If it's a node then check the type and use the nodeName
      if (type) {
        return !!(type === 1 && blockElementsMap[node.nodeName]);
      }
    }

    return false;
  };

  const get = (elm: string | Node): HTMLElement | null =>
    elm && doc && Type.isString(elm)
      ? doc.getElementById(elm)
      : elm as HTMLElement;

  const $$ = <T extends Node>(elm: string | T | T[] | DomQuery<T>): DomQuery<T | Node> => $(typeof elm === 'string' ? get(elm) : elm);

  const getAttrib = (elm: string | Node, name: string, defaultVal?: string): string => {
    let hook, value;

    const $elm = $$(elm);

    if ($elm.length) {
      hook = attrHooks[name];

      if (hook && hook.get) {
        value = hook.get($elm, name);
      } else {
        value = $elm.attr(name);
      }
    }

    if (typeof value === 'undefined') {
      value = defaultVal || '';
    }

    return value;
  };

  const getAttribs = (elm: string | Node): NamedNodeMap | Attr[] => {
    const node = get(elm);

    if (!node) {
      return [];
    }

    return node.attributes;
  };

  const setAttrib = (elm: string | Node, name: string, value: string | boolean | number) => {
    if (value === '') {
      value = null;
    }

    const $elm = $$(elm);
    const originalValue = $elm.attr(name);

    if (!$elm.length) {
      return;
    }

    const hook = attrHooks[name];
    if (hook && hook.set) {
      hook.set($elm, value, name);
    } else {
      $elm.attr(name, value);
    }

    if (originalValue !== value && settings.onSetAttrib) {
      settings.onSetAttrib({
        attrElm: $elm,
        attrName: name,
        attrValue: value
      });
    }
  };

  const clone = (node: Node, deep: boolean) => {
    // TODO: Add feature detection here in the future
    if (!isIE || node.nodeType !== 1 || deep) {
      return node.cloneNode(deep);
    } else {
      // Make a HTML5 safe shallow copy
      const clone = doc.createElement(node.nodeName);

      // Copy attribs
      each(getAttribs(node), function (attr: Attr) {
        setAttrib(clone, attr.nodeName, getAttrib(node, attr.nodeName));
      });

      return clone;
    }
  };

  const getRoot = (): HTMLElement => settings.root_element || doc.body;

  const getViewPort = (argWin?: Window): GeomRect => {
    const vp = VisualViewport.getBounds(argWin);

    // Returns viewport size excluding scrollbars
    return {
      x: vp.x,
      y: vp.y,
      w: vp.width,
      h: vp.height
    };
  };

  const getPos = (elm: string | Node, rootElm?: Node) => Position.getPos(doc.body, get(elm), rootElm);

  const setStyle = (elm: string | Node, name: string | StyleMap, value?: string | number) => {
    const $elm = Type.isString(name) ? $$(elm).css(name, value) : $$(elm).css(name);

    if (settings.update_styles) {
      updateInternalStyleAttr(styles, $elm);
    }
  };

  const setStyles = (elm: string | Node, stylesArg: StyleMap) => {
    const $elm = $$(elm).css(stylesArg);

    if (settings.update_styles) {
      updateInternalStyleAttr(styles, $elm);
    }
  };

  const getStyle = (elm: string | Node, name: string, computed?: boolean): string => {
    const $elm = $$(elm);

    if (computed) {
      return $elm.css(name);
    }

    // Camelcase it, if needed
    name = name.replace(/-(\D)/g, function (a, b) {
      return b.toUpperCase();
    });

    if (name === 'float') {
      name = Env.browser.isIE() ? 'styleFloat' : 'cssFloat';
    }

    return $elm[0] && $elm[0].style ? $elm[0].style[name] : undefined;
  };

  const getSize = (elm: HTMLElement | string): {w: number; h: number} => {
    let w, h;

    elm = get(elm);
    w = getStyle(elm, 'width');
    h = getStyle(elm, 'height');

    // Non pixel value, then force offset/clientWidth
    if (w.indexOf('px') === -1) {
      w = 0;
    }

    // Non pixel value, then force offset/clientWidth
    if (h.indexOf('px') === -1) {
      h = 0;
    }

    return {
      w: parseInt(w, 10) || elm.offsetWidth || elm.clientWidth,
      h: parseInt(h, 10) || elm.offsetHeight || elm.clientHeight
    };
  };

  const getRect = (elm: string | HTMLElement): GeomRect => {
    elm = get(elm);
    const pos = getPos(elm);
    const size = getSize(elm);

    return {
      x: pos.x, y: pos.y,
      w: size.w, h: size.h
    };
  };

  const is = (elm: Node | Node[], selector: string) => {
    let i;

    if (!elm) {
      return false;
    }

    // If it isn't an array then try to do some simple selectors instead of Sizzle for to boost performance
    if (!Array.isArray(elm)) {
      // Simple all selector
      if (selector === '*') {
        return elm.nodeType === 1;
      }

      // Simple selector just elements
      if (simpleSelectorRe.test(selector)) {
        const selectors = selector.toLowerCase().split(/,/);
        const elmName = elm.nodeName.toLowerCase();

        for (i = selectors.length - 1; i >= 0; i--) {
          if (selectors[i] === elmName) {
            return true;
          }
        }

        return false;
      }

      // Is non element
      if (elm.nodeType && elm.nodeType !== 1) {
        return false;
      }
    }

    const elms = !Array.isArray(elm) ? [ elm ] : elm;

    /* eslint new-cap:0 */
    return Sizzle(selector, elms[0].ownerDocument || elms[0], null, elms).length > 0;
  };

  const getParents = (elm: string | Node, selector?: string | ((node: HTMLElement) => boolean | void), root?: Node, collect?: boolean): Element[] => {
    const result = [];
    let selectorVal;

    let node: HTMLElement = get(elm);
    collect = collect === undefined;

    // Default root on inline mode
    root = root || (getRoot().nodeName !== 'BODY' ? getRoot().parentNode : null);

    // Wrap node name as func
    if (Tools.is(selector, 'string')) {
      selectorVal = selector;

      if (selector === '*') {
        selector = function (node) {
          return node.nodeType === 1;
        };
      } else {
        selector = function (node) {
          return is(node, selectorVal);
        };
      }
    }

    while (node) {
      if (node === root || !node.nodeType || node.nodeType === 9) {
        break;
      }

      if (!selector || (typeof selector === 'function' && selector(node))) {
        if (collect) {
          result.push(node);
        } else {
          return [ node ];
        }
      }

      node = node.parentNode as HTMLElement;
    }

    return collect ? result : null;
  };

  const getParent = (node: string | Node, selector?: string | ((node: HTMLElement) => boolean | void), root?: Node): Element => {
    const parents = getParents(node, selector, root, false);
    return parents && parents.length > 0 ? parents[0] : null;
  };

  const _findSib = (node: Node, selector: string | ((node: Node) => boolean), name: string) => {
    let func = selector;

    if (node) {
      // If expression make a function of it using is
      if (typeof selector === 'string') {
        func = function (node) {
          return is(node, selector);
        };
      }

      // Loop all siblings
      for (node = node[name]; node; node = node[name]) {
        if (typeof func === 'function' && func(node)) {
          return node;
        }
      }
    }

    return null;
  };

  const getNext = (node: Node, selector: string | ((node: Node) => boolean)) => _findSib(node, selector, 'nextSibling');

  const getPrev = (node: Node, selector: string | ((node: Node) => boolean)) => _findSib(node, selector, 'previousSibling');

  const select = (selector: string, scope?: Node | string) => Sizzle(selector, get(scope) || settings.root_element || doc, []);

  const run = (elm: RunArguments, func: (node: Element) => any, scope?) => {
    let result;
    const node = typeof elm === 'string' ? get(elm) : elm;

    if (!node) {
      return false;
    }

    if (Tools.isArray(node) && (node.length || node.length === 0)) {
      result = [];

      each(node, function (elm, i) {
        if (elm) {
          if (typeof elm === 'string') {
            elm = get(elm);
          }

          result.push(func.call(scope, elm, i));
        }
      });

      return result;
    }

    const context = scope ? scope : this;

    return func.call(context, node);
  };

  const setAttribs = (elm: string | Node, attrs: Record<string, string | boolean | number>) => {
    $$(elm).each(function (i, node) {
      each(attrs, function (value, name) {
        setAttrib(node, name, value);
      });
    });
  };

  const setHTML = (elm: string | Node, html: string) => {
    const $elm = $$(elm);

    if (isIE) {
      $elm.each(function (i, target: Element) {
        if ((target as any).canHaveHTML === false) {
          return;
        }

        // Remove all child nodes, IE keeps empty text nodes in DOM
        while (target.firstChild) {
          target.removeChild(target.firstChild);
        }

        try {
          // IE will remove comments from the beginning
          // unless you padd the contents with something
          target.innerHTML = '<br>' + html;
          target.removeChild(target.firstChild);
        } catch (ex) {
          // IE sometimes produces an unknown runtime error on innerHTML if it's a div inside a p
          DomQuery('<div></div>').html('<br>' + html).contents().slice(1).appendTo(target);
        }

        return html;
      });
    } else {
      $elm.html(html);
    }
  };

  const add = (parentElm: RunArguments, name: string | Node, attrs?: Record<string, string | boolean | number>, html?: string | Node, create?: boolean): HTMLElement => run(parentElm, function (parentElm) {
    const newElm = typeof name === 'string' ? doc.createElement(name) : name;
    setAttribs(newElm, attrs);

    if (html) {
      if (typeof html !== 'string' && html.nodeType) {
        newElm.appendChild(html);
      } else if (typeof html === 'string') {
        setHTML(newElm, html);
      }
    }

    return !create ? parentElm.appendChild(newElm) : newElm;
  });

  const create = (name: string, attrs?: Record<string, string | boolean | number>, html?: string | Node): HTMLElement => add(doc.createElement(name), name, attrs, html, true);

  const decode = Entities.decode;
  const encode = Entities.encodeAllRaw;

  const createHTML = (name: string, attrs?: Record<string, string>, html?: string): string => {
    let outHtml = '', key;

    outHtml += '<' + name;

    for (key in attrs) {
      if (attrs.hasOwnProperty(key) && attrs[key] !== null && typeof attrs[key] !== 'undefined') {
        outHtml += ' ' + key + '="' + encode(attrs[key]) + '"';
      }
    }

    // A call to tinymce.is doesn't work for some odd reason on IE9 possible bug inside their JS runtime
    if (typeof html !== 'undefined') {
      return outHtml + '>' + html + '</' + name + '>';
    }

    return outHtml + ' />';
  };

  const createFragment = (html?: string): DocumentFragment => {
    let node;

    const container = doc.createElement('div');
    const frag = doc.createDocumentFragment();

    // Append the container to the fragment so as to remove it from
    // the current document context
    frag.appendChild(container);

    if (html) {
      container.innerHTML = html;
    }

    while ((node = container.firstChild)) {
      frag.appendChild(node);
    }

    // Remove the container now that all the children have been transferred
    frag.removeChild(container);

    return frag;
  };

  const remove = (node: string | Node | Node[] | DomQuery, keepChildren?: boolean) => {
    const $node = $$(node);

    if (keepChildren) {
      $node.each(function () {
        let child;

        while ((child = this.firstChild)) {
          if (child.nodeType === 3 && child.data.length === 0) {
            this.removeChild(child);
          } else {
            this.parentNode.insertBefore(child, this);
          }
        }
      }).remove();
    } else {
      $node.remove();
    }

    return $node.length > 1 ? $node.toArray() : $node[0];
  };

  const removeAllAttribs = (e: RunArguments) => run(e, function (e) {
    let i;
    const attrs = e.attributes;
    for (i = attrs.length - 1; i >= 0; i--) {
      e.removeAttributeNode(attrs.item(i));
    }
  });

  const parseStyle = (cssText: string): Record<string, string> => styles.parse(cssText);

  const serializeStyle = (stylesArg: StyleMap, name?: string) => styles.serialize(stylesArg, name);

  const addStyle = (cssText: string) => {
    let head, styleElm;

    // Prevent inline from loading the same styles twice
    if (self !== DOMUtils.DOM && doc === document) {
      if (addedStyles[cssText]) {
        return;
      }

      addedStyles[cssText] = true;
    }

    // Create style element if needed
    styleElm = doc.getElementById('mceDefaultStyles');
    if (!styleElm) {
      styleElm = doc.createElement('style');
      styleElm.id = 'mceDefaultStyles';
      styleElm.type = 'text/css';

      head = doc.getElementsByTagName('head')[0];
      if (head.firstChild) {
        head.insertBefore(styleElm, head.firstChild);
      } else {
        head.appendChild(styleElm);
      }
    }

    // Append style data to old or new style element
    if (styleElm.styleSheet) {
      styleElm.styleSheet.cssText += cssText;
    } else {
      styleElm.appendChild(doc.createTextNode(cssText));
    }
  };

  const loadCSS = (url: string) => {

    // Prevent inline from loading the same CSS file twice
    if (self !== DOMUtils.DOM && doc === document) {
      DOMUtils.DOM.loadCSS(url);
      return;
    }

    if (!url) {
      url = '';
    }

    const head = doc.getElementsByTagName('head')[0];

    each(url.split(','), function (url) {
      url = Tools._addCacheSuffix(url);

      if (files[url]) {
        return;
      }

      files[url] = true;
      const link = create('link', {
        rel: 'stylesheet',
        type: 'text/css',
        href: url,
        ...settings.contentCssCors ? { crossOrigin: 'anonymous' } : { },
        ...settings.referrerPolicy ? { referrerPolicy: settings.referrerPolicy } : { }
      });

      head.appendChild(link);
    });
  };

  const toggleClass = (elm: string | Node | Node[], cls: string, state?: boolean) => {
    $$(elm).toggleClass(cls, state).each(function () {
      if (this.className === '') {
        DomQuery(this).attr('class', null);
      }
    });
  };

  const addClass = (elm: string | Node | Node[], cls: string) => {
    $$(elm).addClass(cls);
  };

  const removeClass = (elm: string | Node, cls: string) => {
    toggleClass(elm, cls, false);
  };

  const hasClass = (elm: string | Node, cls: string) => $$(elm).hasClass(cls);

  const show = (elm: string | Node) => {
    $$(elm).show();
  };

  const hide = (elm: string | Node) => {
    $$(elm).hide();
  };

  const isHidden = (elm: string | Node) => $$(elm).css('display') === 'none';

  const uniqueId = (prefix?: string) => (!prefix ? 'mce_' : prefix) + (counter++);

  const getOuterHTML = (elm: string | Node): string => {
    const node = typeof elm === 'string' ? get(elm) : elm;

    return NodeType.isElement(node) ? node.outerHTML : DomQuery('<div></div>').append(DomQuery(node).clone()).html();
  };

  const setOuterHTML = (elm: string | Node, html: string) => {
    $$(elm).each(function () {
      try {
        // Older FF doesn't have outerHTML 3.6 is still used by some organizations
        if ('outerHTML' in this) {
          this.outerHTML = html;
          return;
        }
      } catch (ex) {
        // Ignore
      }

      // OuterHTML for IE it sometimes produces an "unknown runtime error"
      remove(DomQuery(this).html(html), true);
    });
  };

  const insertAfter = (node: RunArguments, reference: string | Node) => {
    const referenceNode = get(reference);

    return run(node, function (node) {
      const parent = referenceNode.parentNode;
      const nextSibling = referenceNode.nextSibling;

      if (nextSibling) {
        parent.insertBefore(node, nextSibling);
      } else {
        parent.appendChild(node);
      }

      return node;
    });
  };

  const replace = (newElm: Node, oldElm: RunArguments, keepChildren?: boolean) => run(oldElm, function (oldElm) {
    if (Tools.is(oldElm, 'array')) {
      newElm = newElm.cloneNode(true);
    }

    if (keepChildren) {
      each(grep(oldElm.childNodes), function (node) {
        newElm.appendChild(node);
      });
    }

    return oldElm.parentNode.replaceChild(newElm, oldElm);
  });

  const rename = (elm: Node, name: string): Node => {
    let newElm;

    if (elm.nodeName !== name.toUpperCase()) {
      // Rename block element
      newElm = create(name);

      // Copy attribs to new block
      each(getAttribs(elm), function (attrNode: Attr) {
        setAttrib(newElm, attrNode.nodeName, getAttrib(elm, attrNode.nodeName));
      });

      // Replace block
      replace(newElm, elm, true);
    }

    return newElm || elm;
  };

  const findCommonAncestor = (a: Node, b: Node) => {
    let ps = a, pe;

    while (ps) {
      pe = b;

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
    }

    return ps;
  };

  const toHex = (rgbVal: string) => styles.toHex(Tools.trim(rgbVal));

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

  const isEmpty = (node: Node, elements?: Record<string, any>) => {
    let type: number, name: string, brCount = 0;

    // Keep elements with data-bookmark attributes, name attributes or are named anchors
    if (isNonEmptyElement(node)) {
      return false;
    }

    node = node.firstChild;
    if (node) {
      const walker = new TreeWalker(node, node.parentNode);
      const whitespace = schema ? schema.getWhiteSpaceElements() : {};
      elements = elements || (schema ? schema.getNonEmptyElements() : null);

      do {
        type = node.nodeType;

        if (NodeType.isElement(node)) {
          // Ignore bogus elements
          const bogusVal = node.getAttribute('data-mce-bogus');
          if (bogusVal) {
            node = walker.next(bogusVal === 'all');
            continue;
          }

          // Keep empty elements like <img />
          name = node.nodeName.toLowerCase();
          if (elements && elements[name]) {
            // Ignore single BR elements in blocks like <p><br /></p> or <p><span><br /></span></p>
            if (name === 'br') {
              brCount++;
              node = walker.next();
              continue;
            }

            return false;
          }

          // Keep elements with data-bookmark attributes, name attributes or are named anchors
          if (isNonEmptyElement(node)) {
            return false;
          }
        }

        // Keep comment nodes
        if (type === 8) {
          return false;
        }

        // Keep non whitespace text nodes
        if (type === 3 && !isWhitespaceText(node.nodeValue)) {
          return false;
        }

        // Keep whitespace preserve elements
        if (type === 3 && node.parentNode && whitespace[node.parentNode.nodeName] && isWhitespaceText(node.nodeValue)) {
          return false;
        }

        node = walker.next();
      } while (node);
    }

    return brCount <= 1;
  };

  const createRng = () => doc.createRange();

  const split = <T extends Node>(parentElm: Node, splitElm: T, replacementElm?: T): T => {
    let range = createRng();
    let beforeFragment: DocumentFragment;
    let afterFragment: DocumentFragment;
    let parentNode: Node;

    if (parentElm && splitElm) {
      // Get before chunk
      range.setStart(parentElm.parentNode, findNodeIndex(parentElm));
      range.setEnd(splitElm.parentNode, findNodeIndex(splitElm));
      beforeFragment = range.extractContents();

      // Get after chunk
      range = createRng();
      range.setStart(splitElm.parentNode, findNodeIndex(splitElm) + 1);
      range.setEnd(parentElm.parentNode, findNodeIndex(parentElm) + 1);
      afterFragment = range.extractContents();

      // Insert before chunk
      parentNode = parentElm.parentNode;
      parentNode.insertBefore(TrimNode.trimNode(self, beforeFragment), parentElm);

      // Insert middle chunk
      if (replacementElm) {
        parentNode.insertBefore(replacementElm, parentElm);
        // pa.replaceChild(replacementElm, splitElm);
      } else {
        parentNode.insertBefore(splitElm, parentElm);
      }

      // Insert after chunk
      parentNode.insertBefore(TrimNode.trimNode(self, afterFragment), parentElm);
      remove(parentElm);

      return replacementElm || splitElm;
    }
  };

  const bind = (target: Target, name: string, func: EventUtilsCallback<any>, scope?: any) => {
    if (Tools.isArray(target)) {
      let i = target.length;
      const rv = [];

      while (i--) {
        rv[i] = bind(target[i], name, func, scope);
      }

      return rv;
    }

    // Collect all window/document events bound by editor instance
    if (settings.collect && (target === doc || target === win)) {
      boundEvents.push([ target, name, func, scope ]);
    }

    return events.bind(target, name, func, scope || self);
  };

  const unbind = (target: Target, name?: string, func?: EventUtilsCallback<any>) => {
    let i;

    if (Tools.isArray(target)) {
      i = target.length;
      const rv = [];

      while (i--) {
        rv[i] = unbind(target[i], name, func);
      }

      return rv;
    }

    // Remove any bound events matching the input
    if (boundEvents.length > 0 && (target === doc || target === win)) {
      i = boundEvents.length;

      while (i--) {
        const item = boundEvents[i];

        if (target === item[0] && (!name || name === item[1]) && (!func || func === item[2])) {
          events.unbind(item[0], item[1], item[2]);
        }
      }
    }

    return events.unbind(target, name, func);
  };

  const fire = (target: Target, name: string, evt?) => events.fire(target, name, evt);

  const getContentEditable = (node: Node) => {
    if (node && NodeType.isElement(node)) {
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
    let state = null;

    for (; node && node !== root; node = node.parentNode) {
      state = getContentEditable(node);

      if (state !== null) {
        break;
      }
    }

    return state;
  };

  const destroy = () => {
    // Unbind all events bound to window/document by editor instance
    if (boundEvents.length > 0) {
      let i = boundEvents.length;

      while (i--) {
        const item = boundEvents[i];
        events.unbind(item[0], item[1], item[2]);
      }
    }

    // Restore sizzle document to window.document
    // Since the current document might be removed producing "Permission denied" on IE see #6325
    if (Sizzle.setDocument) {
      Sizzle.setDocument();
    }
  };

  const isChildOf = (node: Node, parent: Node) => {
    while (node) {
      if (parent === node) {
        return true;
      }

      node = node.parentNode;
    }

    return false;
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
    isBlock,
    $,
    $$,

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
     * @return {object} Rectangle for specified element object with x, y, w, h fields.
     */
    getRect,

    /**
     * Returns the size dimensions of the specified element.
     *
     * @method getSize
     * @param {Element/String} elm Element object or element ID to get rectangle from.
     * @return {object} Rectangle for specified element object with w, h fields.
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
     * @param {function} selector Selection function or CSS selector to execute on each node.
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
     * @param {function} selector Selection function to execute on each node or CSS pattern.
     * @param {Node} root Optional root element, never go beyond this point.
     * @return {Array} Array of nodes or null if it wasn't found.
     */
    getParents,

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
     * Selects specific elements by a CSS level 3 pattern. For example "div#a1 p.test".
     * This function is optimized for the most common patterns needed in TinyMCE but it also performs well enough
     * on more complex patterns.
     *
     * @method select
     * @param {String} selector CSS level 3 pattern to select/find elements by.
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
     * tinymce.activeEditor.dom.add(tinymce.activeEditor.getBody(), 'p', {title: 'my title'}, 'Some content');
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
     * var el = tinymce.activeEditor.dom.create('div', {id: 'test', 'class': 'myclass'}, 'some content');
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
     * tinymce.activeEditor.selection.setContent(tinymce.activeEditor.dom.createHTML('a', {href: 'test.html'}, 'some line'));
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
    getStyle,

    /**
     * Sets multiple styles on the specified element(s).
     *
     * @method setStyles
     * @param {Element/String/Array} elm DOM element, element id string or array of elements/ids to set styles on.
     * @param {Object} styles Name/Value collection of style items to add to the element(s).
     * @example
     * // Sets styles on all paragraphs in the currently active editor
     * tinymce.activeEditor.dom.setStyles(tinymce.activeEditor.dom.select('p'), {'background-color': 'red', 'color': 'green'});
     *
     * // Sets styles to an element by id in the current document
     * tinymce.DOM.setStyles('mydiv', {'background-color': 'red', 'color': 'green'});
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
     * tinymce.activeEditor.dom.setAttribs(tinymce.activeEditor.dom.select('p'), {'class': 'myclass', title: 'some title'});
     *
     * // Sets class and title attributes on a specific element in the current page
     * tinymce.DOM.setAttribs('mydiv', {'class': 'myclass', title: 'some title'});
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
     * @return {object} Absolute position of the specified element object with x, y fields.
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
     * @param {[type]} cls Class to toggle on/off.
     * @param {[type]} state Optional state to set.
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
     * Entity decodes a string. This method decodes any HTML entities, such as &aring;.
     *
     * @method decode
     * @param {String} s String to decode entities on.
     * @return {String} Entity decoded string.
     */
    decode,

    /**
     * Entity encodes a string. This method encodes the most common entities, such as <>"&.
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
     * Parses the specified RGB color value and returns a hex version of that color.
     *
     * @method toHex
     * @param {String} rgbVal RGB string value like rgb(1,2,3)
     * @return {String} Hex version of that RGB value like #FF00FF.
     */
    toHex,

    /**
     * Executes the specified function on the element by id or dom element node or array of elements/id.
     *
     * @method run
     * @param {String/Element/Array} elm ID or DOM element object or array with ids or elements.
     * @param {function} func Function to execute for each item.
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
     * @example
     * tinymce.DOM.isEmpty(node, {img: true});
     * @method isEmpty
     * @param {Object} elements Optional name/value object with elements that are automatically treated as non-empty elements.
     * @return {Boolean} true/false if the node is empty or not.
     */
    isEmpty,

    /**
     * Creates a new DOM Range object. This will use the native DOM Range API if it's
     * available. If it's not, it will fall back to the custom TinyMCE implementation.
     *
     * @method createRng
     * @return {DOMRange} DOM Range object.
     * @example
     * var rng = tinymce.DOM.createRng();
     * alert(rng.startContainer + "," + rng.startOffset);
     */
    createRng,

    /**
     * Returns the index of the specified node within its parent.
     *
     * @method nodeIndex
     * @param {Node} node Node to look for.
     * @param {boolean} normalized Optional true/false state if the index is what it would be after a normalization.
     * @return {Number} Index of the specified node.
     */
    nodeIndex: findNodeIndex,

    /**
     * Splits an element into two new elements and places the specified split
     * element or elements between the new ones. For example splitting the paragraph at the bold element in
     * this example <p>abc<b>abc</b>123</p> would produce <p>abc</p><b>abc</b><p>123</p>.
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
     * @param {function} func Function to execute when the event occurs.
     * @param {Object} scope Optional scope to execute the function in.
     * @return {function} Function callback handler the same as the one passed in.
     */
    bind,

    /**
     * Removes the specified event handler by name and function from an element or collection of elements.
     *
     * @method unbind
     * @param {Element/Document/Window/Array} target Target element to unbind events on.
     * @param {String} name Event handler name, for example: "click"
     * @param {function} func Function to remove.
     * @return {bool/Array} Bool state of true if the handler was removed, or an array of states if multiple input elements
     * were passed in.
     */
    unbind,

    /**
     * Fires the specified event name with object on target.
     *
     * @method fire
     * @param {Node/Document/Window} target Target element or object to fire event on.
     * @param {String} name Name of the event to fire.
     * @param {Object} evt Event object to send.
     * @return {Event} Event object.
     */
    fire,

    // Returns the content editable state of a node
    getContentEditable,
    getContentEditableParent,

    /**
     * Destroys all internal references to the DOM to solve IE leak issues.
     *
     * @method destroy
     */
    destroy,
    isChildOf,
    dumpRng
  };

  const attrHooks = setupAttrHooks(styles, settings, () => self);

  return self;
}

namespace DOMUtils {
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
  export const DOM: DOMUtils = DOMUtils(document);
  export const nodeIndex = findNodeIndex;
}

export default DOMUtils;
