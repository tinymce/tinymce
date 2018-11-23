/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import DomQuery from 'tinymce/core/api/dom/DomQuery';
import Class from 'tinymce/core/api/util/Class';
import EventDispatcher from 'tinymce/core/api/util/EventDispatcher';
import Tools from 'tinymce/core/api/util/Tools';
import BoxUtils from './BoxUtils';
import ClassList from './ClassList';
import Collection from './Collection';
import ObservableObject from './data/ObservableObject';
import DomUtils from './DomUtils';
import ReflowQueue from './ReflowQueue';
import UiContainer from 'tinymce/ui/UiContainer';
import { document } from '@ephox/dom-globals';

/*eslint consistent-this:0 */

/**
 * This is the base class for all controls and containers. All UI control instances inherit
 * from this one as it has the base logic needed by all of them.
 *
 * @class tinymce.ui.Control
 */

const hasMouseWheelEventSupport = 'onmousewheel' in document;
const hasWheelEventSupport = false;
const classPrefix = 'mce-';
let Control, idCounter = 0;

const proto = {
  Statics: {
    classPrefix
  },

  isRtl () {
    return Control.rtl;
  },

  /**
   * Class/id prefix to use for all controls.
   *
   * @final
   * @field {String} classPrefix
   */
  classPrefix,

  /**
   * Constructs a new control instance with the specified settings.
   *
   * @constructor
   * @param {Object} settings Name/value object with settings.
   * @setting {String} style Style CSS properties to add.
   * @setting {String} border Border box values example: 1 1 1 1
   * @setting {String} padding Padding box values example: 1 1 1 1
   * @setting {String} margin Margin box values example: 1 1 1 1
   * @setting {Number} minWidth Minimal width for the control.
   * @setting {Number} minHeight Minimal height for the control.
   * @setting {String} classes Space separated list of classes to add.
   * @setting {String} role WAI-ARIA role to use for control.
   * @setting {Boolean} hidden Is the control hidden by default.
   * @setting {Boolean} disabled Is the control disabled by default.
   * @setting {String} name Name of the control instance.
   */
  init (settings) {
    const self = this;
    let classes, defaultClasses;

    function applyClasses(classes) {
      let i;

      classes = classes.split(' ');
      for (i = 0; i < classes.length; i++) {
        self.classes.add(classes[i]);
      }
    }

    self.settings = settings = Tools.extend({}, self.Defaults, settings);

    // Initial states
    self._id = settings.id || ('mceu_' + (idCounter++));
    self._aria = { role: settings.role };
    self._elmCache = {};
    self.$ = DomQuery;

    self.state = new ObservableObject({
      visible: true,
      active: false,
      disabled: false,
      value: ''
    });

    self.data = new ObservableObject(settings.data);

    self.classes = new ClassList(function () {
      if (self.state.get('rendered')) {
        self.getEl().className = this.toString();
      }
    });
    self.classes.prefix = self.classPrefix;

    // Setup classes
    classes = settings.classes;
    if (classes) {
      if (self.Defaults) {
        defaultClasses = self.Defaults.classes;

        if (defaultClasses && classes !== defaultClasses) {
          applyClasses(defaultClasses);
        }
      }

      applyClasses(classes);
    }

    Tools.each('title text name visible disabled active value'.split(' '), function (name) {
      if (name in settings) {
        self[name](settings[name]);
      }
    });

    self.on('click', function () {
      if (self.disabled()) {
        return false;
      }
    });

    /**
     * Name/value object with settings for the current control.
     *
     * @field {Object} settings
     */
    self.settings = settings;

    self.borderBox = BoxUtils.parseBox(settings.border);
    self.paddingBox = BoxUtils.parseBox(settings.padding);
    self.marginBox = BoxUtils.parseBox(settings.margin);

    if (settings.hidden) {
      self.hide();
    }
  },

  // Will generate getter/setter methods for these properties
  Properties: 'parent,name',

  /**
   * Returns the root element to render controls into.
   *
   * @method getContainerElm
   * @return {Element} HTML DOM element to render into.
   */
  getContainerElm () {
    const uiContainer = UiContainer.getUiContainer(this);
    return uiContainer ? uiContainer : DomUtils.getContainer();
  },

  /**
   * Returns a control instance for the current DOM element.
   *
   * @method getParentCtrl
   * @param {Element} elm HTML dom element to get parent control from.
   * @return {tinymce.ui.Control} Control instance or undefined.
   */
  getParentCtrl (elm) {
    let ctrl;
    const lookup = this.getRoot().controlIdLookup;

    while (elm && lookup) {
      ctrl = lookup[elm.id];
      if (ctrl) {
        break;
      }

      elm = elm.parentNode;
    }

    return ctrl;
  },

  /**
   * Initializes the current controls layout rect.
   * This will be executed by the layout managers to determine the
   * default minWidth/minHeight etc.
   *
   * @method initLayoutRect
   * @return {Object} Layout rect instance.
   */
  initLayoutRect () {
    const self = this;
    const settings = self.settings;
    let borderBox, layoutRect;
    const elm = self.getEl();
    let width, height, minWidth, minHeight, autoResize;
    let startMinWidth, startMinHeight, initialSize;

    // Measure the current element
    borderBox = self.borderBox = self.borderBox || BoxUtils.measureBox(elm, 'border');
    self.paddingBox = self.paddingBox || BoxUtils.measureBox(elm, 'padding');
    self.marginBox = self.marginBox || BoxUtils.measureBox(elm, 'margin');
    initialSize = DomUtils.getSize(elm);

    // Setup minWidth/minHeight and width/height
    startMinWidth = settings.minWidth;
    startMinHeight = settings.minHeight;
    minWidth = startMinWidth || initialSize.width;
    minHeight = startMinHeight || initialSize.height;
    width = settings.width;
    height = settings.height;
    autoResize = settings.autoResize;
    autoResize = typeof autoResize !== 'undefined' ? autoResize : !width && !height;

    width = width || minWidth;
    height = height || minHeight;

    const deltaW = borderBox.left + borderBox.right;
    const deltaH = borderBox.top + borderBox.bottom;

    const maxW = settings.maxWidth || 0xFFFF;
    const maxH = settings.maxHeight || 0xFFFF;

    // Setup initial layout rect
    self._layoutRect = layoutRect = {
      x: settings.x || 0,
      y: settings.y || 0,
      w: width,
      h: height,
      deltaW,
      deltaH,
      contentW: width - deltaW,
      contentH: height - deltaH,
      innerW: width - deltaW,
      innerH: height - deltaH,
      startMinWidth: startMinWidth || 0,
      startMinHeight: startMinHeight || 0,
      minW: Math.min(minWidth, maxW),
      minH: Math.min(minHeight, maxH),
      maxW,
      maxH,
      autoResize,
      scrollW: 0
    };

    self._lastLayoutRect = {};

    return layoutRect;
  },

  /**
   * Getter/setter for the current layout rect.
   *
   * @method layoutRect
   * @param {Object} [newRect] Optional new layout rect.
   * @return {tinymce.ui.Control/Object} Current control or rect object.
   */
  layoutRect (newRect) {
    const self = this;
    let curRect = self._layoutRect, lastLayoutRect, size, deltaWidth, deltaHeight, repaintControls;

    // Initialize default layout rect
    if (!curRect) {
      curRect = self.initLayoutRect();
    }

    // Set new rect values
    if (newRect) {
      // Calc deltas between inner and outer sizes
      deltaWidth = curRect.deltaW;
      deltaHeight = curRect.deltaH;

      // Set x position
      if (newRect.x !== undefined) {
        curRect.x = newRect.x;
      }

      // Set y position
      if (newRect.y !== undefined) {
        curRect.y = newRect.y;
      }

      // Set minW
      if (newRect.minW !== undefined) {
        curRect.minW = newRect.minW;
      }

      // Set minH
      if (newRect.minH !== undefined) {
        curRect.minH = newRect.minH;
      }

      // Set new width and calculate inner width
      size = newRect.w;
      if (size !== undefined) {
        size = size < curRect.minW ? curRect.minW : size;
        size = size > curRect.maxW ? curRect.maxW : size;
        curRect.w = size;
        curRect.innerW = size - deltaWidth;
      }

      // Set new height and calculate inner height
      size = newRect.h;
      if (size !== undefined) {
        size = size < curRect.minH ? curRect.minH : size;
        size = size > curRect.maxH ? curRect.maxH : size;
        curRect.h = size;
        curRect.innerH = size - deltaHeight;
      }

      // Set new inner width and calculate width
      size = newRect.innerW;
      if (size !== undefined) {
        size = size < curRect.minW - deltaWidth ? curRect.minW - deltaWidth : size;
        size = size > curRect.maxW - deltaWidth ? curRect.maxW - deltaWidth : size;
        curRect.innerW = size;
        curRect.w = size + deltaWidth;
      }

      // Set new height and calculate inner height
      size = newRect.innerH;
      if (size !== undefined) {
        size = size < curRect.minH - deltaHeight ? curRect.minH - deltaHeight : size;
        size = size > curRect.maxH - deltaHeight ? curRect.maxH - deltaHeight : size;
        curRect.innerH = size;
        curRect.h = size + deltaHeight;
      }

      // Set new contentW
      if (newRect.contentW !== undefined) {
        curRect.contentW = newRect.contentW;
      }

      // Set new contentH
      if (newRect.contentH !== undefined) {
        curRect.contentH = newRect.contentH;
      }

      // Compare last layout rect with the current one to see if we need to repaint or not
      lastLayoutRect = self._lastLayoutRect;
      if (lastLayoutRect.x !== curRect.x || lastLayoutRect.y !== curRect.y ||
        lastLayoutRect.w !== curRect.w || lastLayoutRect.h !== curRect.h) {
        repaintControls = Control.repaintControls;

        if (repaintControls) {
          if (repaintControls.map && !repaintControls.map[self._id]) {
            repaintControls.push(self);
            repaintControls.map[self._id] = true;
          }
        }

        lastLayoutRect.x = curRect.x;
        lastLayoutRect.y = curRect.y;
        lastLayoutRect.w = curRect.w;
        lastLayoutRect.h = curRect.h;
      }

      return self;
    }

    return curRect;
  },

  /**
   * Repaints the control after a layout operation.
   *
   * @method repaint
   */
  repaint () {
    const self = this;
    let style, bodyStyle, bodyElm, rect, borderBox;
    let borderW, borderH, lastRepaintRect, round, value;

    // Use Math.round on all values on IE < 9
    round = !document.createRange ? Math.round : function (value) {
      return value;
    };

    style = self.getEl().style;
    rect = self._layoutRect;
    lastRepaintRect = self._lastRepaintRect || {};

    borderBox = self.borderBox;
    borderW = borderBox.left + borderBox.right;
    borderH = borderBox.top + borderBox.bottom;

    if (rect.x !== lastRepaintRect.x) {
      style.left = round(rect.x) + 'px';
      lastRepaintRect.x = rect.x;
    }

    if (rect.y !== lastRepaintRect.y) {
      style.top = round(rect.y) + 'px';
      lastRepaintRect.y = rect.y;
    }

    if (rect.w !== lastRepaintRect.w) {
      value = round(rect.w - borderW);
      style.width = (value >= 0 ? value : 0) + 'px';
      lastRepaintRect.w = rect.w;
    }

    if (rect.h !== lastRepaintRect.h) {
      value = round(rect.h - borderH);
      style.height = (value >= 0 ? value : 0) + 'px';
      lastRepaintRect.h = rect.h;
    }

    // Update body if needed
    if (self._hasBody && rect.innerW !== lastRepaintRect.innerW) {
      value = round(rect.innerW);

      bodyElm = self.getEl('body');
      if (bodyElm) {
        bodyStyle = bodyElm.style;
        bodyStyle.width = (value >= 0 ? value : 0) + 'px';
      }

      lastRepaintRect.innerW = rect.innerW;
    }

    if (self._hasBody && rect.innerH !== lastRepaintRect.innerH) {
      value = round(rect.innerH);

      bodyElm = bodyElm || self.getEl('body');
      if (bodyElm) {
        bodyStyle = bodyStyle || bodyElm.style;
        bodyStyle.height = (value >= 0 ? value : 0) + 'px';
      }

      lastRepaintRect.innerH = rect.innerH;
    }

    self._lastRepaintRect = lastRepaintRect;
    self.fire('repaint', {}, false);
  },

  /**
   * Updates the controls layout rect by re-measuing it.
   */
  updateLayoutRect () {
    const self = this;

    self.parent()._lastRect = null;

    DomUtils.css(self.getEl(), { width: '', height: '' });

    self._layoutRect = self._lastRepaintRect = self._lastLayoutRect = null;
    self.initLayoutRect();
  },

  /**
   * Binds a callback to the specified event. This event can both be
   * native browser events like "click" or custom ones like PostRender.
   *
   * The callback function will be passed a DOM event like object that enables yout do stop propagation.
   *
   * @method on
   * @param {String} name Name of the event to bind. For example "click".
   * @param {String/function} callback Callback function to execute ones the event occurs.
   * @return {tinymce.ui.Control} Current control object.
   */
  on (name, callback) {
    const self = this;

    function resolveCallbackName(name) {
      let callback, scope;

      if (typeof name !== 'string') {
        return name;
      }

      return function (e) {
        if (!callback) {
          self.parentsAndSelf().each(function (ctrl) {
            const callbacks = ctrl.settings.callbacks;

            if (callbacks && (callback = callbacks[name])) {
              scope = ctrl;
              return false;
            }
          });
        }

        if (!callback) {
          e.action = name;
          this.fire('execute', e);
          return;
        }

        return callback.call(scope, e);
      };
    }

    getEventDispatcher(self).on(name, resolveCallbackName(callback));

    return self;
  },

  /**
   * Unbinds the specified event and optionally a specific callback. If you omit the name
   * parameter all event handlers will be removed. If you omit the callback all event handles
   * by the specified name will be removed.
   *
   * @method off
   * @param {String} [name] Name for the event to unbind.
   * @param {function} [callback] Callback function to unbind.
   * @return {tinymce.ui.Control} Current control object.
   */
  off (name, callback) {
    getEventDispatcher(this).off(name, callback);
    return this;
  },

  /**
   * Fires the specified event by name and arguments on the control. This will execute all
   * bound event handlers.
   *
   * @method fire
   * @param {String} name Name of the event to fire.
   * @param {Object} [args] Arguments to pass to the event.
   * @param {Boolean} [bubble] Value to control bubbling. Defaults to true.
   * @return {Object} Current arguments object.
   */
  fire (name, args, bubble) {
    const self = this;

    args = args || {};

    if (!args.control) {
      args.control = self;
    }

    args = getEventDispatcher(self).fire(name, args);

    // Bubble event up to parents
    if (bubble !== false && self.parent) {
      let parent = self.parent();
      while (parent && !args.isPropagationStopped()) {
        parent.fire(name, args, false);
        parent = parent.parent();
      }
    }

    return args;
  },

  /**
   * Returns true/false if the specified event has any listeners.
   *
   * @method hasEventListeners
   * @param {String} name Name of the event to check for.
   * @return {Boolean} True/false state if the event has listeners.
   */
  hasEventListeners (name) {
    return getEventDispatcher(this).has(name);
  },

  /**
   * Returns a control collection with all parent controls.
   *
   * @method parents
   * @param {String} selector Optional selector expression to find parents.
   * @return {tinymce.ui.Collection} Collection with all parent controls.
   */
  parents (selector) {
    const self = this;
    let ctrl, parents = new Collection();

    // Add each parent to collection
    for (ctrl = self.parent(); ctrl; ctrl = ctrl.parent()) {
      parents.add(ctrl);
    }

    // Filter away everything that doesn't match the selector
    if (selector) {
      parents = parents.filter(selector);
    }

    return parents;
  },

  /**
   * Returns the current control and it's parents.
   *
   * @method parentsAndSelf
   * @param {String} selector Optional selector expression to find parents.
   * @return {tinymce.ui.Collection} Collection with all parent controls.
   */
  parentsAndSelf (selector) {
    return new Collection(this).add(this.parents(selector));
  },

  /**
   * Returns the control next to the current control.
   *
   * @method next
   * @return {tinymce.ui.Control} Next control instance.
   */
  next () {
    const parentControls = this.parent().items();

    return parentControls[parentControls.indexOf(this) + 1];
  },

  /**
   * Returns the control previous to the current control.
   *
   * @method prev
   * @return {tinymce.ui.Control} Previous control instance.
   */
  prev () {
    const parentControls = this.parent().items();

    return parentControls[parentControls.indexOf(this) - 1];
  },

  /**
   * Sets the inner HTML of the control element.
   *
   * @method innerHtml
   * @param {String} html Html string to set as inner html.
   * @return {tinymce.ui.Control} Current control object.
   */
  innerHtml (html) {
    this.$el.html(html);
    return this;
  },

  /**
   * Returns the control DOM element or sub element.
   *
   * @method getEl
   * @param {String} [suffix] Suffix to get element by.
   * @return {Element} HTML DOM element for the current control or it's children.
   */
  getEl (suffix) {
    const id = suffix ? this._id + '-' + suffix : this._id;

    if (!this._elmCache[id]) {
      this._elmCache[id] = DomQuery('#' + id)[0];
    }

    return this._elmCache[id];
  },

  /**
   * Sets the visible state to true.
   *
   * @method show
   * @return {tinymce.ui.Control} Current control instance.
   */
  show () {
    return this.visible(true);
  },

  /**
   * Sets the visible state to false.
   *
   * @method hide
   * @return {tinymce.ui.Control} Current control instance.
   */
  hide () {
    return this.visible(false);
  },

  /**
   * Focuses the current control.
   *
   * @method focus
   * @return {tinymce.ui.Control} Current control instance.
   */
  focus () {
    try {
      this.getEl().focus();
    } catch (ex) {
      // Ignore IE error
    }

    return this;
  },

  /**
   * Blurs the current control.
   *
   * @method blur
   * @return {tinymce.ui.Control} Current control instance.
   */
  blur () {
    this.getEl().blur();

    return this;
  },

  /**
   * Sets the specified aria property.
   *
   * @method aria
   * @param {String} name Name of the aria property to set.
   * @param {String} value Value of the aria property.
   * @return {tinymce.ui.Control} Current control instance.
   */
  aria (name, value) {
    const self = this, elm = self.getEl(self.ariaTarget);

    if (typeof value === 'undefined') {
      return self._aria[name];
    }

    self._aria[name] = value;

    if (self.state.get('rendered')) {
      elm.setAttribute(name === 'role' ? name : 'aria-' + name, value);
    }

    return self;
  },

  /**
   * Encodes the specified string with HTML entities. It will also
   * translate the string to different languages.
   *
   * @method encode
   * @param {String/Object/Array} text Text to entity encode.
   * @param {Boolean} [translate=true] False if the contents shouldn't be translated.
   * @return {String} Encoded and possible traslated string.
   */
  encode (text, translate) {
    if (translate !== false) {
      text = this.translate(text);
    }

    return (text || '').replace(/[&<>"]/g, function (match) {
      return '&#' + match.charCodeAt(0) + ';';
    });
  },

  /**
   * Returns the translated string.
   *
   * @method translate
   * @param {String} text Text to translate.
   * @return {String} Translated string or the same as the input.
   */
  translate (text) {
    return Control.translate ? Control.translate(text) : text;
  },

  /**
   * Adds items before the current control.
   *
   * @method before
   * @param {Array/tinymce.ui.Collection} items Array of items to prepend before this control.
   * @return {tinymce.ui.Control} Current control instance.
   */
  before (items) {
    const self = this, parent = self.parent();

    if (parent) {
      parent.insert(items, parent.items().indexOf(self), true);
    }

    return self;
  },

  /**
   * Adds items after the current control.
   *
   * @method after
   * @param {Array/tinymce.ui.Collection} items Array of items to append after this control.
   * @return {tinymce.ui.Control} Current control instance.
   */
  after (items) {
    const self = this, parent = self.parent();

    if (parent) {
      parent.insert(items, parent.items().indexOf(self));
    }

    return self;
  },

  /**
   * Removes the current control from DOM and from UI collections.
   *
   * @method remove
   * @return {tinymce.ui.Control} Current control instance.
   */
  remove () {
    const self = this;
    const elm = self.getEl();
    const parent = self.parent();
    let newItems, i;

    if (self.items) {
      const controls = self.items().toArray();
      i = controls.length;
      while (i--) {
        controls[i].remove();
      }
    }

    if (parent && parent.items) {
      newItems = [];

      parent.items().each(function (item) {
        if (item !== self) {
          newItems.push(item);
        }
      });

      parent.items().set(newItems);
      parent._lastRect = null;
    }

    if (self._eventsRoot && self._eventsRoot === self) {
      DomQuery(elm).off();
    }

    const lookup = self.getRoot().controlIdLookup;
    if (lookup) {
      delete lookup[self._id];
    }

    if (elm && elm.parentNode) {
      elm.parentNode.removeChild(elm);
    }

    self.state.set('rendered', false);
    self.state.destroy();

    self.fire('remove');

    return self;
  },

  /**
   * Renders the control before the specified element.
   *
   * @method renderBefore
   * @param {Element} elm Element to render before.
   * @return {tinymce.ui.Control} Current control instance.
   */
  renderBefore (elm) {
    DomQuery(elm).before(this.renderHtml());
    this.postRender();
    return this;
  },

  /**
   * Renders the control to the specified element.
   *
   * @method renderBefore
   * @param {Element} elm Element to render to.
   * @return {tinymce.ui.Control} Current control instance.
   */
  renderTo (elm) {
    DomQuery(elm || this.getContainerElm()).append(this.renderHtml());
    this.postRender();
    return this;
  },

  preRender () {
  },

  render () {
  },

  renderHtml () {
    return '<div id="' + this._id + '" class="' + this.classes + '"></div>';
  },

  /**
   * Post render method. Called after the control has been rendered to the target.
   *
   * @method postRender
   * @return {tinymce.ui.Control} Current control instance.
   */
  postRender () {
    const self = this;
    const settings = self.settings;
    let elm, box, parent, name, parentEventsRoot;

    self.$el = DomQuery(self.getEl());
    self.state.set('rendered', true);

    // Bind on<event> settings
    for (name in settings) {
      if (name.indexOf('on') === 0) {
        self.on(name.substr(2), settings[name]);
      }
    }

    if (self._eventsRoot) {
      for (parent = self.parent(); !parentEventsRoot && parent; parent = parent.parent()) {
        parentEventsRoot = parent._eventsRoot;
      }

      if (parentEventsRoot) {
        for (name in parentEventsRoot._nativeEvents) {
          self._nativeEvents[name] = true;
        }
      }
    }

    bindPendingEvents(self);

    if (settings.style) {
      elm = self.getEl();
      if (elm) {
        elm.setAttribute('style', settings.style);
        elm.style.cssText = settings.style;
      }
    }

    if (self.settings.border) {
      box = self.borderBox;
      self.$el.css({
        'border-top-width': box.top,
        'border-right-width': box.right,
        'border-bottom-width': box.bottom,
        'border-left-width': box.left
      });
    }

    // Add instance to lookup
    const root = self.getRoot();
    if (!root.controlIdLookup) {
      root.controlIdLookup = {};
    }

    root.controlIdLookup[self._id] = self;

    for (const key in self._aria) {
      self.aria(key, self._aria[key]);
    }

    if (self.state.get('visible') === false) {
      self.getEl().style.display = 'none';
    }

    self.bindStates();

    self.state.on('change:visible', function (e) {
      const state = e.value;
      let parentCtrl;

      if (self.state.get('rendered')) {
        self.getEl().style.display = state === false ? 'none' : '';

        // Need to force a reflow here on IE 8
        self.getEl().getBoundingClientRect();
      }

      // Parent container needs to reflow
      parentCtrl = self.parent();
      if (parentCtrl) {
        parentCtrl._lastRect = null;
      }

      self.fire(state ? 'show' : 'hide');

      ReflowQueue.add(self);
    });

    self.fire('postrender', {}, false);
  },

  bindStates () {
  },

  /**
   * Scrolls the current control into view.
   *
   * @method scrollIntoView
   * @param {String} align Alignment in view top|center|bottom.
   * @return {tinymce.ui.Control} Current control instance.
   */
  scrollIntoView (align) {
    function getOffset(elm, rootElm) {
      let x, y, parent = elm;

      x = y = 0;
      while (parent && parent !== rootElm && parent.nodeType) {
        x += parent.offsetLeft || 0;
        y += parent.offsetTop || 0;
        parent = parent.offsetParent;
      }

      return { x, y };
    }

    const elm = this.getEl(), parentElm = elm.parentNode;
    let x, y, width, height, parentWidth, parentHeight;
    const pos = getOffset(elm, parentElm);

    x = pos.x;
    y = pos.y;
    width = elm.offsetWidth;
    height = elm.offsetHeight;
    parentWidth = parentElm.clientWidth;
    parentHeight = parentElm.clientHeight;

    if (align === 'end') {
      x -= parentWidth - width;
      y -= parentHeight - height;
    } else if (align === 'center') {
      x -= (parentWidth / 2) - (width / 2);
      y -= (parentHeight / 2) - (height / 2);
    }

    parentElm.scrollLeft = x;
    parentElm.scrollTop = y;

    return this;
  },

  getRoot () {
    let ctrl = this, rootControl;
    const parents = [];

    while (ctrl) {
      if (ctrl.rootControl) {
        rootControl = ctrl.rootControl;
        break;
      }

      parents.push(ctrl);
      rootControl = ctrl;
      ctrl = ctrl.parent();
    }

    if (!rootControl) {
      rootControl = this;
    }

    let i = parents.length;
    while (i--) {
      parents[i].rootControl = rootControl;
    }

    return rootControl;
  },

  /**
   * Reflows the current control and it's parents.
   * This should be used after you for example append children to the current control so
   * that the layout managers know that they need to reposition everything.
   *
   * @example
   * container.append({type: 'button', text: 'My button'}).reflow();
   *
   * @method reflow
   * @return {tinymce.ui.Control} Current control instance.
   */
  reflow () {
    ReflowQueue.remove(this);

    const parent = this.parent();
    if (parent && parent._layout && !parent._layout.isNative()) {
      parent.reflow();
    }

    return this;
  }

  /**
   * Sets/gets the parent container for the control.
   *
   * @method parent
   * @param {tinymce.ui.Container} parent Optional parent to set.
   * @return {tinymce.ui.Control} Parent control or the current control on a set action.
   */
  // parent: function(parent) {} -- Generated

  /**
   * Sets/gets the text for the control.
   *
   * @method text
   * @param {String} value Value to set to control.
   * @return {String/tinymce.ui.Control} Current control on a set operation or current value on a get.
   */
  // text: function(value) {} -- Generated

  /**
   * Sets/gets the disabled state on the control.
   *
   * @method disabled
   * @param {Boolean} state Value to set to control.
   * @return {Boolean/tinymce.ui.Control} Current control on a set operation or current state on a get.
   */
  // disabled: function(state) {} -- Generated

  /**
   * Sets/gets the active for the control.
   *
   * @method active
   * @param {Boolean} state Value to set to control.
   * @return {Boolean/tinymce.ui.Control} Current control on a set operation or current state on a get.
   */
  // active: function(state) {} -- Generated

  /**
   * Sets/gets the name for the control.
   *
   * @method name
   * @param {String} value Value to set to control.
   * @return {String/tinymce.ui.Control} Current control on a set operation or current value on a get.
   */
  // name: function(value) {} -- Generated

  /**
   * Sets/gets the title for the control.
   *
   * @method title
   * @param {String} value Value to set to control.
   * @return {String/tinymce.ui.Control} Current control on a set operation or current value on a get.
   */
  // title: function(value) {} -- Generated

  /**
   * Sets/gets the visible for the control.
   *
   * @method visible
   * @param {Boolean} state Value to set to control.
   * @return {Boolean/tinymce.ui.Control} Current control on a set operation or current state on a get.
   */
  // visible: function(value) {} -- Generated
};

/**
 * Setup state properties.
 */
Tools.each('text title visible disabled active value'.split(' '), function (name) {
  proto[name] = function (value) {
    if (arguments.length === 0) {
      return this.state.get(name);
    }

    if (typeof value !== 'undefined') {
      this.state.set(name, value);
    }

    return this;
  };
});

Control = Class.extend(proto);

function getEventDispatcher(obj) {
  if (!obj._eventDispatcher) {
    obj._eventDispatcher = new EventDispatcher({
      scope: obj,
      toggleEvent (name, state) {
        if (state && EventDispatcher.isNative(name)) {
          if (!obj._nativeEvents) {
            obj._nativeEvents = {};
          }

          obj._nativeEvents[name] = true;

          if (obj.state.get('rendered')) {
            bindPendingEvents(obj);
          }
        }
      }
    });
  }

  return obj._eventDispatcher;
}

function bindPendingEvents(eventCtrl) {
  let i, l, parents, eventRootCtrl, nativeEvents, name;

  function delegate(e) {
    const control = eventCtrl.getParentCtrl(e.target);

    if (control) {
      control.fire(e.type, e);
    }
  }

  function mouseLeaveHandler() {
    const ctrl = eventRootCtrl._lastHoverCtrl;

    if (ctrl) {
      ctrl.fire('mouseleave', { target: ctrl.getEl() });

      ctrl.parents().each(function (ctrl) {
        ctrl.fire('mouseleave', { target: ctrl.getEl() });
      });

      eventRootCtrl._lastHoverCtrl = null;
    }
  }

  function mouseEnterHandler(e) {
    let ctrl = eventCtrl.getParentCtrl(e.target), lastCtrl = eventRootCtrl._lastHoverCtrl, idx = 0, i, parents, lastParents;

    // Over on a new control
    if (ctrl !== lastCtrl) {
      eventRootCtrl._lastHoverCtrl = ctrl;

      parents = ctrl.parents().toArray().reverse();
      parents.push(ctrl);

      if (lastCtrl) {
        lastParents = lastCtrl.parents().toArray().reverse();
        lastParents.push(lastCtrl);

        for (idx = 0; idx < lastParents.length; idx++) {
          if (parents[idx] !== lastParents[idx]) {
            break;
          }
        }

        for (i = lastParents.length - 1; i >= idx; i--) {
          lastCtrl = lastParents[i];
          lastCtrl.fire('mouseleave', {
            target: lastCtrl.getEl()
          });
        }
      }

      for (i = idx; i < parents.length; i++) {
        ctrl = parents[i];
        ctrl.fire('mouseenter', {
          target: ctrl.getEl()
        });
      }
    }
  }

  function fixWheelEvent(e) {
    e.preventDefault();

    if (e.type === 'mousewheel') {
      e.deltaY = -1 / 40 * e.wheelDelta;

      if (e.wheelDeltaX) {
        e.deltaX = -1 / 40 * e.wheelDeltaX;
      }
    } else {
      e.deltaX = 0;
      e.deltaY = e.detail;
    }

    e = eventCtrl.fire('wheel', e);
  }

  nativeEvents = eventCtrl._nativeEvents;
  if (nativeEvents) {
    // Find event root element if it exists
    parents = eventCtrl.parents().toArray();
    parents.unshift(eventCtrl);
    for (i = 0, l = parents.length; !eventRootCtrl && i < l; i++) {
      eventRootCtrl = parents[i]._eventsRoot;
    }

    // Event root wasn't found the use the root control
    if (!eventRootCtrl) {
      eventRootCtrl = parents[parents.length - 1] || eventCtrl;
    }

    // Set the eventsRoot property on children that didn't have it
    eventCtrl._eventsRoot = eventRootCtrl;
    for (l = i, i = 0; i < l; i++) {
      parents[i]._eventsRoot = eventRootCtrl;
    }

    let eventRootDelegates = eventRootCtrl._delegates;
    if (!eventRootDelegates) {
      eventRootDelegates = eventRootCtrl._delegates = {};
    }

    // Bind native event delegates
    for (name in nativeEvents) {
      if (!nativeEvents) {
        return false;
      }

      if (name === 'wheel' && !hasWheelEventSupport) {
        if (hasMouseWheelEventSupport) {
          DomQuery(eventCtrl.getEl()).on('mousewheel', fixWheelEvent);
        } else {
          DomQuery(eventCtrl.getEl()).on('DOMMouseScroll', fixWheelEvent);
        }

        continue;
      }

      // Special treatment for mousenter/mouseleave since these doesn't bubble
      if (name === 'mouseenter' || name === 'mouseleave') {
        // Fake mousenter/mouseleave
        if (!eventRootCtrl._hasMouseEnter) {
          DomQuery(eventRootCtrl.getEl()).on('mouseleave', mouseLeaveHandler).on('mouseover', mouseEnterHandler);
          eventRootCtrl._hasMouseEnter = 1;
        }
      } else if (!eventRootDelegates[name]) {
        DomQuery(eventRootCtrl.getEl()).on(name, delegate);
        eventRootDelegates[name] = true;
      }

      // Remove the event once it's bound
      nativeEvents[name] = false;
    }
  }
}

export default Control;