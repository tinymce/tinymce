/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Env from 'tinymce/core/api/Env';
import Tools from 'tinymce/core/api/util/Tools';
import { GeomRect } from 'tinymce/core/api/geom/Rect';
import { document, DocumentFragment, HTMLElement } from '@ephox/dom-globals';

/**
 * Private UI DomUtils proxy.
 *
 * @private
 * @class tinymce.ui.DomUtils
 */

let count = 0;

const funcs = {
  id () {
    return 'mceu_' + (count++);
  },

  create (name, attrs, children?): HTMLElement {
    const elm = document.createElement(name);

    DOMUtils.DOM.setAttribs(elm, attrs);

    if (typeof children === 'string') {
      elm.innerHTML = children;
    } else {
      Tools.each(children, function (child) {
        if (child.nodeType) {
          elm.appendChild(child);
        }
      });
    }

    return elm;
  },

  createFragment (html): DocumentFragment {
    return DOMUtils.DOM.createFragment(html);
  },

  getWindowSize (): GeomRect {
    return DOMUtils.DOM.getViewPort();
  },

  getSize (elm) {
    let width, height;

    if (elm.getBoundingClientRect) {
      const rect = elm.getBoundingClientRect();

      width = Math.max(rect.width || (rect.right - rect.left), elm.offsetWidth);
      height = Math.max(rect.height || (rect.bottom - rect.bottom), elm.offsetHeight);
    } else {
      width = elm.offsetWidth;
      height = elm.offsetHeight;
    }

    return { width, height };
  },

  getPos (elm, root?) {
    return DOMUtils.DOM.getPos(elm, root || funcs.getContainer());
  },

  getContainer () {
    return Env.container ? Env.container : document.body;
  },

  getViewPort (win?) {
    return DOMUtils.DOM.getViewPort(win);
  },

  get (id) {
    return document.getElementById(id);
  },

  addClass (elm, cls) {
    return DOMUtils.DOM.addClass(elm, cls);
  },

  removeClass (elm, cls) {
    return DOMUtils.DOM.removeClass(elm, cls);
  },

  hasClass (elm, cls) {
    return DOMUtils.DOM.hasClass(elm, cls);
  },

  toggleClass (elm, cls, state) {
    return DOMUtils.DOM.toggleClass(elm, cls, state);
  },

  css (elm, name, value?) {
    return DOMUtils.DOM.setStyle(elm, name, value);
  },

  getRuntimeStyle (elm, name) {
    return DOMUtils.DOM.getStyle(elm, name, true);
  },

  on (target, name, callback, scope?) {
    return DOMUtils.DOM.bind(target, name, callback, scope);
  },

  off (target, name, callback) {
    return DOMUtils.DOM.unbind(target, name, callback);
  },

  fire (target, name, args) {
    return DOMUtils.DOM.fire(target, name, args);
  },

  innerHtml (elm, html) {
    // Workaround for <div> in <p> bug on IE 8 #6178
    DOMUtils.DOM.setHTML(elm, html);
  }
};

export default funcs;