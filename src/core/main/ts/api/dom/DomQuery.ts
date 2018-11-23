/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import EventUtils from './EventUtils';
import Sizzle from './Sizzle';
import Env from '../Env';
import Tools from '../util/Tools';
import { document } from '@ephox/dom-globals';

/**
 * This class mimics most of the jQuery API:
 *
 * This is whats currently implemented:
 * - Utility functions
 * - DOM traversial
 * - DOM manipulation
 * - Event binding
 *
 * This is not currently implemented:
 * - Dimension
 * - Ajax
 * - Animation
 * - Advanced chaining
 *
 * @example
 * var $ = tinymce.dom.DomQuery;
 * $('p').attr('attr', 'value').addClass('class');
 *
 * @class tinymce.dom.DomQuery
 */

const doc = document, push = Array.prototype.push, slice = Array.prototype.slice;
const rquickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/;
const Event = EventUtils.Event;
const skipUniques = Tools.makeMap('children,contents,next,prev');

const isDefined = function (obj) {
  return typeof obj !== 'undefined';
};

const isString = function (obj) {
  return typeof obj === 'string';
};

const isWindow = function (obj) {
  return obj && obj === obj.window;
};

const createFragment = function (html, fragDoc) {
  let frag, node, container;

  fragDoc = fragDoc || doc;
  container = fragDoc.createElement('div');
  frag = fragDoc.createDocumentFragment();
  container.innerHTML = html;

  while ((node = container.firstChild)) {
    frag.appendChild(node);
  }

  return frag;
};

const domManipulate = function (targetNodes, sourceItem, callback, reverse?) {
  let i;

  if (isString(sourceItem)) {
    sourceItem = createFragment(sourceItem, getElementDocument(targetNodes[0]));
  } else if (sourceItem.length && !sourceItem.nodeType) {
    sourceItem = DomQuery.makeArray(sourceItem);

    if (reverse) {
      for (i = sourceItem.length - 1; i >= 0; i--) {
        domManipulate(targetNodes, sourceItem[i], callback, reverse);
      }
    } else {
      for (i = 0; i < sourceItem.length; i++) {
        domManipulate(targetNodes, sourceItem[i], callback, reverse);
      }
    }

    return targetNodes;
  }

  if (sourceItem.nodeType) {
    i = targetNodes.length;
    while (i--) {
      callback.call(targetNodes[i], sourceItem);
    }
  }

  return targetNodes;
};

const hasClass = function (node, className) {
  return node && className && (' ' + node.className + ' ').indexOf(' ' + className + ' ') !== -1;
};

const wrap = function (elements, wrapper, all?) {
  let lastParent, newWrapper;

  wrapper = DomQuery(wrapper)[0];

  elements.each(function () {
    const self = this;

    if (!all || lastParent !== self.parentNode) {
      lastParent = self.parentNode;
      newWrapper = wrapper.cloneNode(false);
      self.parentNode.insertBefore(newWrapper, self);
      newWrapper.appendChild(self);
    } else {
      newWrapper.appendChild(self);
    }
  });

  return elements;
};

const numericCssMap = Tools.makeMap('fillOpacity fontWeight lineHeight opacity orphans widows zIndex zoom', ' ');
const booleanMap = Tools.makeMap('checked compact declare defer disabled ismap multiple nohref noshade nowrap readonly selected', ' ');
const propFix = {
  for: 'htmlFor',
  class: 'className',
  readonly: 'readOnly'
};
const cssFix = {
  float: 'cssFloat'
};

const attrHooks = {}, cssHooks = {};

const DomQuery: any = function (selector, context) {
  /*eslint new-cap:0 */
  return new DomQuery.fn.init(selector, context);
};

const inArray = function (item, array) {
  let i;

  if (array.indexOf) {
    return array.indexOf(item);
  }

  i = array.length;
  while (i--) {
    if (array[i] === item) {
      return i;
    }
  }

  return -1;
};

const whiteSpaceRegExp = /^\s*|\s*$/g;

const trim = function (str) {
  return (str === null || str === undefined) ? '' : ('' + str).replace(whiteSpaceRegExp, '');
};

const each = function (obj, callback) {
  let length, key, i, value;

  if (obj) {
    length = obj.length;

    if (length === undefined) {
      // Loop object items
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          value = obj[key];
          if (callback.call(value, key, value) === false) {
            break;
          }
        }
      }
    } else {
      // Loop array items
      for (i = 0; i < length; i++) {
        value = obj[i];
        if (callback.call(value, i, value) === false) {
          break;
        }
      }
    }
  }

  return obj;
};

const grep = function (array, callback) {
  const out = [];

  each(array, function (i, item) {
    if (callback(item, i)) {
      out.push(item);
    }
  });

  return out;
};

const getElementDocument = function (element) {
  if (!element) {
    return doc;
  }

  if (element.nodeType === 9) {
    return element;
  }

  return element.ownerDocument;
};

DomQuery.fn = DomQuery.prototype = {
  constructor: DomQuery,

  /**
   * Selector for the current set.
   *
   * @property selector
   * @type String
   */
  selector: '',

  /**
   * Context used to create the set.
   *
   * @property context
   * @type Element
   */
  context: null,

  /**
   * Number of items in the current set.
   *
   * @property length
   * @type Number
   */
  length: 0,

  /**
   * Constructs a new DomQuery instance with the specified selector or context.
   *
   * @constructor
   * @method init
   * @param {String/Array/DomQuery} selector Optional CSS selector/Array or array like object or HTML string.
   * @param {Document/Element} context Optional context to search in.
   */
  init (selector, context) {
    const self = this;
    let match, node;

    if (!selector) {
      return self;
    }

    if (selector.nodeType) {
      self.context = self[0] = selector;
      self.length = 1;

      return self;
    }

    if (context && context.nodeType) {
      self.context = context;
    } else {
      if (context) {
        return DomQuery(selector).attr(context);
      }

      self.context = context = document;
    }

    if (isString(selector)) {
      self.selector = selector;

      if (selector.charAt(0) === '<' && selector.charAt(selector.length - 1) === '>' && selector.length >= 3) {
        match = [null, selector, null];
      } else {
        match = rquickExpr.exec(selector);
      }

      if (match) {
        if (match[1]) {
          node = createFragment(selector, getElementDocument(context)).firstChild;

          while (node) {
            push.call(self, node);
            node = node.nextSibling;
          }
        } else {
          node = getElementDocument(context).getElementById(match[2]);

          if (!node) {
            return self;
          }

          if (node.id !== match[2]) {
            return self.find(selector);
          }

          self.length = 1;
          self[0] = node;
        }
      } else {
        return DomQuery(context).find(selector);
      }
    } else {
      this.add(selector, false);
    }

    return self;
  },

  /**
   * Converts the current set to an array.
   *
   * @method toArray
   * @return {Array} Array of all nodes in set.
   */
  toArray () {
    return Tools.toArray(this);
  },

  /**
   * Adds new nodes to the set.
   *
   * @method add
   * @param {Array/tinymce.core.dom.DomQuery} items Array of all nodes to add to set.
   * @param {Boolean} sort Optional sort flag that enables sorting of elements.
   * @return {tinymce.dom.DomQuery} New instance with nodes added.
   */
  add (items, sort) {
    const self = this;
    let nodes, i;

    if (isString(items)) {
      return self.add(DomQuery(items));
    }

    if (sort !== false) {
      nodes = DomQuery.unique(self.toArray().concat(DomQuery.makeArray(items)));
      self.length = nodes.length;
      for (i = 0; i < nodes.length; i++) {
        self[i] = nodes[i];
      }
    } else {
      push.apply(self, DomQuery.makeArray(items));
    }

    return self;
  },

  /**
   * Sets/gets attributes on the elements in the current set.
   *
   * @method attr
   * @param {String/Object} name Name of attribute to get or an object with attributes to set.
   * @param {String} value Optional value to set.
   * @return {tinymce.dom.DomQuery/String} Current set or the specified attribute when only the name is specified.
   */
  attr (name, value) {
    const self = this;
    let hook;

    if (typeof name === 'object') {
      each(name, function (name, value) {
        self.attr(name, value);
      });
    } else if (isDefined(value)) {
      this.each(function () {
        let hook;

        if (this.nodeType === 1) {
          hook = attrHooks[name];
          if (hook && hook.set) {
            hook.set(this, value);
            return;
          }

          if (value === null) {
            this.removeAttribute(name, 2);
          } else {
            this.setAttribute(name, value, 2);
          }
        }
      });
    } else {
      if (self[0] && self[0].nodeType === 1) {
        hook = attrHooks[name];
        if (hook && hook.get) {
          return hook.get(self[0], name);
        }

        if (booleanMap[name]) {
          return self.prop(name) ? name : undefined;
        }

        value = self[0].getAttribute(name, 2);

        if (value === null) {
          value = undefined;
        }
      }

      return value;
    }

    return self;
  },

  /**
   * Removes attributse on the elements in the current set.
   *
   * @method removeAttr
   * @param {String/Object} name Name of attribute to remove.
   * @return {tinymce.dom.DomQuery/String} Current set.
   */
  removeAttr (name) {
    return this.attr(name, null);
  },

  /**
   * Sets/gets properties on the elements in the current set.
   *
   * @method attr
   * @param {String/Object} name Name of property to get or an object with properties to set.
   * @param {String} value Optional value to set.
   * @return {tinymce.dom.DomQuery/String} Current set or the specified property when only the name is specified.
   */
  prop (name, value) {
    const self = this;

    name = propFix[name] || name;

    if (typeof name === 'object') {
      each(name, function (name, value) {
        self.prop(name, value);
      });
    } else if (isDefined(value)) {
      this.each(function () {
        if (this.nodeType === 1) {
          this[name] = value;
        }
      });
    } else {
      if (self[0] && self[0].nodeType && name in self[0]) {
        return self[0][name];
      }

      return value;
    }

    return self;
  },

  /**
   * Sets/gets styles on the elements in the current set.
   *
   * @method css
   * @param {String/Object} name Name of style to get or an object with styles to set.
   * @param {String} value Optional value to set.
   * @return {tinymce.dom.DomQuery/String} Current set or the specified style when only the name is specified.
   */
  css (name, value) {
    const self = this;
    let elm, hook;

    const camel = function (name) {
      return name.replace(/-(\D)/g, function (a, b) {
        return b.toUpperCase();
      });
    };

    const dashed = function (name) {
      return name.replace(/[A-Z]/g, function (a) {
        return '-' + a;
      });
    };

    if (typeof name === 'object') {
      each(name, function (name, value) {
        self.css(name, value);
      });
    } else {
      if (isDefined(value)) {
        name = camel(name);

        // Default px suffix on these
        if (typeof value === 'number' && !numericCssMap[name]) {
          value = value.toString() + 'px';
        }

        self.each(function () {
          const style = this.style;

          hook = cssHooks[name];
          if (hook && hook.set) {
            hook.set(this, value);
            return;
          }

          try {
            this.style[cssFix[name] || name] = value;
          } catch (ex) {
            // Ignore
          }

          if (value === null || value === '') {
            if (style.removeProperty) {
              style.removeProperty(dashed(name));
            } else {
              style.removeAttribute(name);
            }
          }
        });
      } else {
        elm = self[0];

        hook = cssHooks[name];
        if (hook && hook.get) {
          return hook.get(elm);
        }

        if (elm.ownerDocument.defaultView) {
          try {
            return elm.ownerDocument.defaultView.getComputedStyle(elm, null).getPropertyValue(dashed(name));
          } catch (ex) {
            return undefined;
          }
        } else if (elm.currentStyle) {
          return elm.currentStyle[camel(name)];
        } else {
          return '';
        }
      }
    }

    return self;
  },

  /**
   * Removes all nodes in set from the document.
   *
   * @method remove
   * @return {tinymce.dom.DomQuery} Current set with the removed nodes.
   */
  remove () {
    const self = this;
    let node, i = this.length;

    while (i--) {
      node = self[i];
      Event.clean(node);

      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    }

    return this;
  },

  /**
   * Empties all elements in set.
   *
   * @method empty
   * @return {tinymce.dom.DomQuery} Current set with the empty nodes.
   */
  empty () {
    const self = this;
    let node, i = this.length;

    while (i--) {
      node = self[i];
      while (node.firstChild) {
        node.removeChild(node.firstChild);
      }
    }

    return this;
  },

  /**
   * Sets or gets the HTML of the current set or first set node.
   *
   * @method html
   * @param {String} value Optional innerHTML value to set on each element.
   * @return {tinymce.dom.DomQuery/String} Current set or the innerHTML of the first element.
   */
  html (value) {
    const self = this;
    let i;

    if (isDefined(value)) {
      i = self.length;

      try {
        while (i--) {
          self[i].innerHTML = value;
        }
      } catch (ex) {
        // Workaround for "Unknown runtime error" when DIV is added to P on IE
        DomQuery(self[i]).empty().append(value);
      }

      return self;
    }

    return self[0] ? self[0].innerHTML : '';
  },

  /**
   * Sets or gets the text of the current set or first set node.
   *
   * @method text
   * @param {String} value Optional innerText value to set on each element.
   * @return {tinymce.dom.DomQuery/String} Current set or the innerText of the first element.
   */
  text (value) {
    const self = this;
    let i;

    if (isDefined(value)) {
      i = self.length;
      while (i--) {
        if ('innerText' in self[i]) {
          self[i].innerText = value;
        } else {
          self[0].textContent = value;
        }
      }

      return self;
    }

    return self[0] ? (self[0].innerText || self[0].textContent) : '';
  },

  /**
   * Appends the specified node/html or node set to the current set nodes.
   *
   * @method append
   * @param {String/Element/Array/tinymce.dom.DomQuery} content Content to append to each element in set.
   * @return {tinymce.dom.DomQuery} Current set.
   */
  append () {
    return domManipulate(this, arguments, function (node) {
      // Either element or Shadow Root
      if (this.nodeType === 1 || (this.host && this.host.nodeType === 1)) {
        this.appendChild(node);
      }
    });
  },

  /**
   * Prepends the specified node/html or node set to the current set nodes.
   *
   * @method prepend
   * @param {String/Element/Array/tinymce.dom.DomQuery} content Content to prepend to each element in set.
   * @return {tinymce.dom.DomQuery} Current set.
   */
  prepend () {
    return domManipulate(this, arguments, function (node) {
      // Either element or Shadow Root
      if (this.nodeType === 1 || (this.host && this.host.nodeType === 1)) {
        this.insertBefore(node, this.firstChild);
      }
    }, true);
  },

  /**
   * Adds the specified elements before current set nodes.
   *
   * @method before
   * @param {String/Element/Array/tinymce.dom.DomQuery} content Content to add before to each element in set.
   * @return {tinymce.dom.DomQuery} Current set.
   */
  before () {
    const self = this;

    if (self[0] && self[0].parentNode) {
      return domManipulate(self, arguments, function (node) {
        this.parentNode.insertBefore(node, this);
      });
    }

    return self;
  },

  /**
   * Adds the specified elements after current set nodes.
   *
   * @method after
   * @param {String/Element/Array/tinymce.dom.DomQuery} content Content to add after to each element in set.
   * @return {tinymce.dom.DomQuery} Current set.
   */
  after () {
    const self = this;

    if (self[0] && self[0].parentNode) {
      return domManipulate(self, arguments, function (node) {
        this.parentNode.insertBefore(node, this.nextSibling);
      }, true);
    }

    return self;
  },

  /**
   * Appends the specified set nodes to the specified selector/instance.
   *
   * @method appendTo
   * @param {String/Element/Array/tinymce.dom.DomQuery} val Item to append the current set to.
   * @return {tinymce.dom.DomQuery} Current set with the appended nodes.
   */
  appendTo (val) {
    DomQuery(val).append(this);

    return this;
  },

  /**
   * Prepends the specified set nodes to the specified selector/instance.
   *
   * @method prependTo
   * @param {String/Element/Array/tinymce.dom.DomQuery} val Item to prepend the current set to.
   * @return {tinymce.dom.DomQuery} Current set with the prepended nodes.
   */
  prependTo (val) {
    DomQuery(val).prepend(this);

    return this;
  },

  /**
   * Replaces the nodes in set with the specified content.
   *
   * @method replaceWith
   * @param {String/Element/Array/tinymce.dom.DomQuery} content Content to replace nodes with.
   * @return {tinymce.dom.DomQuery} Set with replaced nodes.
   */
  replaceWith (content) {
    return this.before(content).remove();
  },

  /**
   * Wraps all elements in set with the specified wrapper.
   *
   * @method wrap
   * @param {String/Element/Array/tinymce.dom.DomQuery} content Content to wrap nodes with.
   * @return {tinymce.dom.DomQuery} Set with wrapped nodes.
   */
  wrap (content) {
    return wrap(this, content);
  },

  /**
   * Wraps all nodes in set with the specified wrapper. If the nodes are siblings all of them
   * will be wrapped in the same wrapper.
   *
   * @method wrapAll
   * @param {String/Element/Array/tinymce.dom.DomQuery} content Content to wrap nodes with.
   * @return {tinymce.dom.DomQuery} Set with wrapped nodes.
   */
  wrapAll (content) {
    return wrap(this, content, true);
  },

  /**
   * Wraps all elements inner contents in set with the specified wrapper.
   *
   * @method wrapInner
   * @param {String/Element/Array/tinymce.dom.DomQuery} content Content to wrap nodes with.
   * @return {tinymce.dom.DomQuery} Set with wrapped nodes.
   */
  wrapInner (content) {
    this.each(function () {
      DomQuery(this).contents().wrapAll(content);
    });

    return this;
  },

  /**
   * Unwraps all elements by removing the parent element of each item in set.
   *
   * @method unwrap
   * @return {tinymce.dom.DomQuery} Set with unwrapped nodes.
   */
  unwrap () {
    return this.parent().each(function () {
      DomQuery(this).replaceWith(this.childNodes);
    });
  },

  /**
   * Clones all nodes in set.
   *
   * @method clone
   * @return {tinymce.dom.DomQuery} Set with cloned nodes.
   */
  clone () {
    const result = [];

    this.each(function () {
      result.push(this.cloneNode(true));
    });

    return DomQuery(result);
  },

  /**
   * Adds the specified class name to the current set elements.
   *
   * @method addClass
   * @param {String} className Class name to add.
   * @return {tinymce.dom.DomQuery} Current set.
   */
  addClass (className) {
    return this.toggleClass(className, true);
  },

  /**
   * Removes the specified class name to the current set elements.
   *
   * @method removeClass
   * @param {String} className Class name to remove.
   * @return {tinymce.dom.DomQuery} Current set.
   */
  removeClass (className) {
    return this.toggleClass(className, false);
  },

  /**
   * Toggles the specified class name on the current set elements.
   *
   * @method toggleClass
   * @param {String} className Class name to add/remove.
   * @param {Boolean} state Optional state to toggle on/off.
   * @return {tinymce.dom.DomQuery} Current set.
   */
  toggleClass (className, state) {
    const self = this;

    // Functions are not supported
    if (typeof className !== 'string') {
      return self;
    }

    if (className.indexOf(' ') !== -1) {
      each(className.split(' '), function () {
        self.toggleClass(this, state);
      });
    } else {
      self.each(function (index, node) {
        let existingClassName, classState;

        classState = hasClass(node, className);
        if (classState !== state) {
          existingClassName = node.className;

          if (classState) {
            node.className = trim((' ' + existingClassName + ' ').replace(' ' + className + ' ', ' '));
          } else {
            node.className += existingClassName ? ' ' + className : className;
          }
        }
      });
    }

    return self;
  },

  /**
   * Returns true/false if the first item in set has the specified class.
   *
   * @method hasClass
   * @param {String} className Class name to check for.
   * @return {Boolean} True/false if the set has the specified class.
   */
  hasClass (className) {
    return hasClass(this[0], className);
  },

  /**
   * Executes the callback function for each item DomQuery collection. If you return false in the
   * callback it will break the loop.
   *
   * @method each
   * @param {function} callback Callback function to execute for each item.
   * @return {tinymce.dom.DomQuery} Current set.
   */
  each (callback) {
    return each(this, callback);
  },

  /**
   * Binds an event with callback function to the elements in set.
   *
   * @method on
   * @param {String} name Name of the event to bind.
   * @param {function} callback Callback function to execute when the event occurs.
   * @return {tinymce.dom.DomQuery} Current set.
   */
  on (name, callback) {
    return this.each(function () {
      Event.bind(this, name, callback);
    });
  },

  /**
   * Unbinds an event with callback function to the elements in set.
   *
   * @method off
   * @param {String} name Optional name of the event to bind.
   * @param {function} callback Optional callback function to execute when the event occurs.
   * @return {tinymce.dom.DomQuery} Current set.
   */
  off (name, callback) {
    return this.each(function () {
      Event.unbind(this, name, callback);
    });
  },

  /**
   * Triggers the specified event by name or event object.
   *
   * @method trigger
   * @param {String/Object} name Name of the event to trigger or event object.
   * @return {tinymce.dom.DomQuery} Current set.
   */
  trigger (name) {
    return this.each(function () {
      if (typeof name === 'object') {
        Event.fire(this, name.type, name);
      } else {
        Event.fire(this, name);
      }
    });
  },

  /**
   * Shows all elements in set.
   *
   * @method show
   * @return {tinymce.dom.DomQuery} Current set.
   */
  show () {
    return this.css('display', '');
  },

  /**
   * Hides all elements in set.
   *
   * @method hide
   * @return {tinymce.dom.DomQuery} Current set.
   */
  hide () {
    return this.css('display', 'none');
  },

  /**
   * Slices the current set.
   *
   * @method slice
   * @param {Number} start Start index to slice at.
   * @param {Number} end Optional end index to end slice at.
   * @return {tinymce.dom.DomQuery} Sliced set.
   */
  slice () {
    return new DomQuery(slice.apply(this, arguments));
  },

  /**
   * Makes the set equal to the specified index.
   *
   * @method eq
   * @param {Number} index Index to set it equal to.
   * @return {tinymce.dom.DomQuery} Single item set.
   */
  eq (index) {
    return index === -1 ? this.slice(index) : this.slice(index, +index + 1);
  },

  /**
   * Makes the set equal to first element in set.
   *
   * @method first
   * @return {tinymce.dom.DomQuery} Single item set.
   */
  first () {
    return this.eq(0);
  },

  /**
   * Makes the set equal to last element in set.
   *
   * @method last
   * @return {tinymce.dom.DomQuery} Single item set.
   */
  last () {
    return this.eq(-1);
  },

  /**
   * Finds elements by the specified selector for each element in set.
   *
   * @method find
   * @param {String} selector Selector to find elements by.
   * @return {tinymce.dom.DomQuery} Set with matches elements.
   */
  find (selector) {
    let i, l;
    const ret = [];

    for (i = 0, l = this.length; i < l; i++) {
      DomQuery.find(selector, this[i], ret);
    }

    return DomQuery(ret);
  },

  /**
   * Filters the current set with the specified selector.
   *
   * @method filter
   * @param {String/function} selector Selector to filter elements by.
   * @return {tinymce.dom.DomQuery} Set with filtered elements.
   */
  filter (selector) {
    if (typeof selector === 'function') {
      return DomQuery(grep(this.toArray(), function (item, i) {
        return selector(i, item);
      }));
    }

    return DomQuery(DomQuery.filter(selector, this.toArray()));
  },

  /**
   * Gets the current node or any parent matching the specified selector.
   *
   * @method closest
   * @param {String/Element/tinymce.dom.DomQuery} selector Selector or element to find.
   * @return {tinymce.dom.DomQuery} Set with closest elements.
   */
  closest (selector) {
    const result = [];

    if (selector instanceof DomQuery) {
      selector = selector[0];
    }

    this.each(function (i, node) {
      while (node) {
        if (typeof selector === 'string' && DomQuery(node).is(selector)) {
          result.push(node);
          break;
        } else if (node === selector) {
          result.push(node);
          break;
        }

        node = node.parentNode;
      }
    });

    return DomQuery(result);
  },

  /**
   * Returns the offset of the first element in set or sets the top/left css properties of all elements in set.
   *
   * @method offset
   * @param {Object} offset Optional offset object to set on each item.
   * @return {Object/tinymce.dom.DomQuery} Returns the first element offset or the current set if you specified an offset.
   */
  offset (offset) {
    let elm, doc, docElm;
    let x = 0, y = 0, pos;

    if (!offset) {
      elm = this[0];

      if (elm) {
        doc = elm.ownerDocument;
        docElm = doc.documentElement;

        if (elm.getBoundingClientRect) {
          pos = elm.getBoundingClientRect();
          x = pos.left + (docElm.scrollLeft || doc.body.scrollLeft) - docElm.clientLeft;
          y = pos.top + (docElm.scrollTop || doc.body.scrollTop) - docElm.clientTop;
        }
      }

      return {
        left: x,
        top: y
      };
    }

    return this.css(offset);
  },

  push,
  sort: [].sort,
  splice: [].splice
};

// Static members
Tools.extend(DomQuery, {
  /**
   * Extends the specified object with one or more objects.
   *
   * @static
   * @method extend
   * @param {Object} target Target object to extend with new items.
   * @param {Object..} object Object to extend the target with.
   * @return {Object} Extended input object.
   */
  extend: Tools.extend,

  /**
   * Creates an array out of an array like object.
   *
   * @static
   * @method makeArray
   * @param {Object} object Object to convert to array.
   * @return {Array} Array produced from object.
   */
  makeArray (object) {
    if (isWindow(object) || object.nodeType) {
      return [object];
    }

    return Tools.toArray(object);
  },

  /**
   * Returns the index of the specified item inside the array.
   *
   * @static
   * @method inArray
   * @param {Object} item Item to look for.
   * @param {Array} array Array to look for item in.
   * @return {Number} Index of the item or -1.
   */
  inArray,

  /**
   * Returns true/false if the specified object is an array or not.
   *
   * @static
   * @method isArray
   * @param {Object} array Object to check if it's an array or not.
   * @return {Boolean} True/false if the object is an array.
   */
  isArray: Tools.isArray,

  /**
   * Executes the callback function for each item in array/object. If you return false in the
   * callback it will break the loop.
   *
   * @static
   * @method each
   * @param {Object} obj Object to iterate.
   * @param {function} callback Callback function to execute for each item.
   */
  each,

  /**
   * Removes whitespace from the beginning and end of a string.
   *
   * @static
   * @method trim
   * @param {String} str String to remove whitespace from.
   * @return {String} New string with removed whitespace.
   */
  trim,

  /**
   * Filters out items from the input array by calling the specified function for each item.
   * If the function returns false the item will be excluded if it returns true it will be included.
   *
   * @static
   * @method grep
   * @param {Array} array Array of items to loop though.
   * @param {function} callback Function to call for each item. Include/exclude depends on it's return value.
   * @return {Array} New array with values imported and filtered based in input.
   * @example
   * // Filter out some items, this will return an array with 4 and 5
   * var items = DomQuery.grep([1, 2, 3, 4, 5], function(v) {return v > 3;});
   */
  grep,

  // Sizzle
  find: Sizzle,
  expr: Sizzle.selectors,
  unique: Sizzle.uniqueSort,
  text: Sizzle.getText,
  contains: Sizzle.contains,
  filter (expr, elems, not) {
    let i = elems.length;

    if (not) {
      expr = ':not(' + expr + ')';
    }

    while (i--) {
      if (elems[i].nodeType !== 1) {
        elems.splice(i, 1);
      }
    }

    if (elems.length === 1) {
      elems = DomQuery.find.matchesSelector(elems[0], expr) ? [elems[0]] : [];
    } else {
      elems = DomQuery.find.matches(expr, elems);
    }

    return elems;
  }
});

const dir = function (el, prop, until?) {
  const matched = [];
  let cur = el[prop];

  if (typeof until !== 'string' && until instanceof DomQuery) {
    until = until[0];
  }

  while (cur && cur.nodeType !== 9) {
    if (until !== undefined) {
      if (cur === until) {
        break;
      }

      if (typeof until === 'string' && DomQuery(cur).is(until)) {
        break;
      }
    }

    if (cur.nodeType === 1) {
      matched.push(cur);
    }

    cur = cur[prop];
  }

  return matched;
};

const sibling = function (node, siblingName, nodeType, until?) {
  const result = [];

  if (until instanceof DomQuery) {
    until = until[0];
  }

  for (; node; node = node[siblingName]) {
    if (nodeType && node.nodeType !== nodeType) {
      continue;
    }

    if (until !== undefined) {
      if (node === until) {
        break;
      }

      if (typeof until === 'string' && DomQuery(node).is(until)) {
        break;
      }
    }

    result.push(node);
  }

  return result;
};

const firstSibling = function (node, siblingName, nodeType) {
  for (node = node[siblingName]; node; node = node[siblingName]) {
    if (node.nodeType === nodeType) {
      return node;
    }
  }

  return null;
};

each({
  /**
   * Returns a new collection with the parent of each item in current collection matching the optional selector.
   *
   * @method parent
   * @param {Element/tinymce.dom.DomQuery} node Node to match parents against.
   * @return {tinymce.dom.DomQuery} New DomQuery instance with all matching parents.
   */
  parent (node) {
    const parent = node.parentNode;

    return parent && parent.nodeType !== 11 ? parent : null;
  },

  /**
   * Returns a new collection with the all the parents of each item in current collection matching the optional selector.
   *
   * @method parents
   * @param {Element/tinymce.dom.DomQuery} node Node to match parents against.
   * @return {tinymce.dom.DomQuery} New DomQuery instance with all matching parents.
   */
  parents (node) {
    return dir(node, 'parentNode');
  },

  /**
   * Returns a new collection with next sibling of each item in current collection matching the optional selector.
   *
   * @method next
   * @param {Element/tinymce.dom.DomQuery} node Node to match the next element against.
   * @return {tinymce.dom.DomQuery} New DomQuery instance with all matching elements.
   */
  next (node) {
    return firstSibling(node, 'nextSibling', 1);
  },

  /**
   * Returns a new collection with previous sibling of each item in current collection matching the optional selector.
   *
   * @method prev
   * @param {Element/tinymce.dom.DomQuery} node Node to match the previous element against.
   * @return {tinymce.dom.DomQuery} New DomQuery instance with all matching elements.
   */
  prev (node) {
    return firstSibling(node, 'previousSibling', 1);
  },

  /**
   * Returns all child elements matching the optional selector.
   *
   * @method children
   * @param {Element/tinymce.dom.DomQuery} node Node to match the elements against.
   * @return {tinymce.dom.DomQuery} New DomQuery instance with all matching elements.
   */
  children (node) {
    return sibling(node.firstChild, 'nextSibling', 1);
  },

  /**
   * Returns all child nodes matching the optional selector.
   *
   * @method contents
   * @param {Element/tinymce.dom.DomQuery} node Node to get the contents of.
   * @return {tinymce.dom.DomQuery} New DomQuery instance with all matching elements.
   */
  contents (node) {
    return Tools.toArray((node.nodeName === 'iframe' ? node.contentDocument || node.contentWindow.document : node).childNodes);
  }
}, function (name, fn) {
  DomQuery.fn[name] = function (selector) {
    const self = this;
    let result = [];

    self.each(function () {
      const nodes = fn.call(result, this, selector, result);

      if (nodes) {
        if (DomQuery.isArray(nodes)) {
          result.push.apply(result, nodes);
        } else {
          result.push(nodes);
        }
      }
    });

    // If traversing on multiple elements we might get the same elements twice
    if (this.length > 1) {
      if (!skipUniques[name]) {
        result = DomQuery.unique(result);
      }

      if (name.indexOf('parents') === 0) {
        result = result.reverse();
      }
    }

    result = DomQuery(result);

    if (selector) {
      return result.filter(selector);
    }

    return result;
  };
});

each({
  /**
   * Returns a new collection with the all the parents until the matching selector/element
   * of each item in current collection matching the optional selector.
   *
   * @method parentsUntil
   * @param {Element/tinymce.dom.DomQuery} node Node to find parent of.
   * @param {String/Element/tinymce.dom.DomQuery} until Until the matching selector or element.
   * @return {tinymce.dom.DomQuery} New DomQuery instance with all matching parents.
   */
  parentsUntil (node, until) {
    return dir(node, 'parentNode', until);
  },

  /**
   * Returns a new collection with all next siblings of each item in current collection matching the optional selector.
   *
   * @method nextUntil
   * @param {Element/tinymce.dom.DomQuery} node Node to find next siblings on.
   * @param {String/Element/tinymce.dom.DomQuery} until Until the matching selector or element.
   * @return {tinymce.dom.DomQuery} New DomQuery instance with all matching elements.
   */
  nextUntil (node, until) {
    return sibling(node, 'nextSibling', 1, until).slice(1);
  },

  /**
   * Returns a new collection with all previous siblings of each item in current collection matching the optional selector.
   *
   * @method prevUntil
   * @param {Element/tinymce.dom.DomQuery} node Node to find previous siblings on.
   * @param {String/Element/tinymce.dom.DomQuery} until Until the matching selector or element.
   * @return {tinymce.dom.DomQuery} New DomQuery instance with all matching elements.
   */
  prevUntil (node, until) {
    return sibling(node, 'previousSibling', 1, until).slice(1);
  }
}, function (name, fn) {
  DomQuery.fn[name] = function (selector, filter) {
    const self = this;
    let result = [];

    self.each(function () {
      const nodes = fn.call(result, this, selector, result);

      if (nodes) {
        if (DomQuery.isArray(nodes)) {
          result.push.apply(result, nodes);
        } else {
          result.push(nodes);
        }
      }
    });

    // If traversing on multiple elements we might get the same elements twice
    if (this.length > 1) {
      result = DomQuery.unique(result);

      if (name.indexOf('parents') === 0 || name === 'prevUntil') {
        result = result.reverse();
      }
    }

    result = DomQuery(result);

    if (filter) {
      return result.filter(filter);
    }

    return result;
  };
});

/**
 * Returns true/false if the current set items matches the selector.
 *
 * @method is
 * @param {String} selector Selector to match the elements against.
 * @return {Boolean} True/false if the current set matches the selector.
 */
DomQuery.fn.is = function (selector) {
  return !!selector && this.filter(selector).length > 0;
};

DomQuery.fn.init.prototype = DomQuery.fn;

DomQuery.overrideDefaults = function (callback) {
  let defaults;

  const sub: any = function (selector, context) {
    defaults = defaults || callback();

    if (arguments.length === 0) {
      selector = defaults.element;
    }

    if (!context) {
      context = defaults.context;
    }

    return new sub.fn.init(selector, context);
  };

  DomQuery.extend(sub, this);

  return sub;
};

const appendHooks = function (targetHooks, prop, hooks) {
  each(hooks, function (name, func) {
    targetHooks[name] = targetHooks[name] || {};
    targetHooks[name][prop] = func;
  });
};

if (Env.ie && Env.ie < 8) {
  appendHooks(attrHooks, 'get', {
    maxlength (elm) {
      const value = elm.maxLength;

      if (value === 0x7fffffff) {
        return undefined;
      }

      return value;
    },

    size (elm) {
      const value = elm.size;

      if (value === 20) {
        return undefined;
      }

      return value;
    },

    class (elm) {
      return elm.className;
    },

    style (elm) {
      const value = elm.style.cssText;

      if (value.length === 0) {
        return undefined;
      }

      return value;
    }
  });

  appendHooks(attrHooks, 'set', {
    class (elm, value) {
      elm.className = value;
    },

    style (elm, value) {
      elm.style.cssText = value;
    }
  });
}

if (Env.ie && Env.ie < 9) {
  /*jshint sub:true */
  /*eslint dot-notation: 0*/
  cssFix.float = 'styleFloat';

  appendHooks(cssHooks, 'set', {
    opacity (elm, value) {
      const style = elm.style;

      if (value === null || value === '') {
        style.removeAttribute('filter');
      } else {
        style.zoom = 1;
        style.filter = 'alpha(opacity=' + (value * 100) + ')';
      }
    }
  });
}

DomQuery.attrHooks = attrHooks;
DomQuery.cssHooks = cssHooks;

export default DomQuery;