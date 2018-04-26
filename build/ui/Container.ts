/**
 * Container.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Control from './Control';
import Collection from './Collection';
import Selector from './Selector';
import Factory from 'tinymce/core/api/ui/Factory';
import KeyboardNavigation from './KeyboardNavigation';
import Tools from 'tinymce/core/api/util/Tools';
import $ from 'tinymce/core/api/dom/DomQuery';
import ClassList from './ClassList';
import ReflowQueue from './ReflowQueue';

/**
 * Container control. This is extended by all controls that can have
 * children such as panels etc. You can also use this class directly as an
 * generic container instance. The container doesn't have any specific role or style.
 *
 * @-x-less Container.less
 * @class tinymce.ui.Container
 * @extends tinymce.ui.Control
 */

const selectorCache = {};

export default Control.extend({
  /**
   * Constructs a new control instance with the specified settings.
   *
   * @constructor
   * @param {Object} settings Name/value object with settings.
   * @setting {Array} items Items to add to container in JSON format or control instances.
   * @setting {String} layout Layout manager by name to use.
   * @setting {Object} defaults Default settings to apply to all items.
   */
  init (settings) {
    const self = this;

    self._super(settings);
    settings = self.settings;

    if (settings.fixed) {
      self.state.set('fixed', true);
    }

    self._items = new Collection();

    if (self.isRtl()) {
      self.classes.add('rtl');
    }

    self.bodyClasses = new ClassList(function () {
      if (self.state.get('rendered')) {
        self.getEl('body').className = this.toString();
      }
    });
    self.bodyClasses.prefix = self.classPrefix;

    self.classes.add('container');
    self.bodyClasses.add('container-body');

    if (settings.containerCls) {
      self.classes.add(settings.containerCls);
    }

    self._layout = Factory.create((settings.layout || '') + 'layout');

    if (self.settings.items) {
      self.add(self.settings.items);
    } else {
      self.add(self.render());
    }

    // TODO: Fix this!
    self._hasBody = true;
  },

  /**
   * Returns a collection of child items that the container currently have.
   *
   * @method items
   * @return {tinymce.ui.Collection} Control collection direct child controls.
   */
  items () {
    return this._items;
  },

  /**
   * Find child controls by selector.
   *
   * @method find
   * @param {String} selector Selector CSS pattern to find children by.
   * @return {tinymce.ui.Collection} Control collection with child controls.
   */
  find (selector) {
    selector = selectorCache[selector] = selectorCache[selector] || new Selector(selector);

    return selector.find(this);
  },

  /**
   * Adds one or many items to the current container. This will create instances of
   * the object representations if needed.
   *
   * @method add
   * @param {Array/Object/tinymce.ui.Control} items Array or item that will be added to the container.
   * @return {tinymce.ui.Collection} Current collection control.
   */
  add (items) {
    const self = this;

    self.items().add(self.create(items)).parent(self);

    return self;
  },

  /**
   * Focuses the current container instance. This will look
   * for the first control in the container and focus that.
   *
   * @method focus
   * @param {Boolean} keyboard Optional true/false if the focus was a keyboard focus or not.
   * @return {tinymce.ui.Collection} Current instance.
   */
  focus (keyboard) {
    const self = this;
    let focusCtrl, keyboardNav, items;

    if (keyboard) {
      keyboardNav = self.keyboardNav || self.parents().eq(-1)[0].keyboardNav;

      if (keyboardNav) {
        keyboardNav.focusFirst(self);
        return;
      }
    }

    items = self.find('*');

    // TODO: Figure out a better way to auto focus alert dialog buttons
    if (self.statusbar) {
      items.add(self.statusbar.items());
    }

    items.each(function (ctrl) {
      if (ctrl.settings.autofocus) {
        focusCtrl = null;
        return false;
      }

      if (ctrl.canFocus) {
        focusCtrl = focusCtrl || ctrl;
      }
    });

    if (focusCtrl) {
      focusCtrl.focus();
    }

    return self;
  },

  /**
   * Replaces the specified child control with a new control.
   *
   * @method replace
   * @param {tinymce.ui.Control} oldItem Old item to be replaced.
   * @param {tinymce.ui.Control} newItem New item to be inserted.
   */
  replace (oldItem, newItem) {
    let ctrlElm;
    const items = this.items();
    let i = items.length;

    // Replace the item in collection
    while (i--) {
      if (items[i] === oldItem) {
        items[i] = newItem;
        break;
      }
    }

    if (i >= 0) {
      // Remove new item from DOM
      ctrlElm = newItem.getEl();
      if (ctrlElm) {
        ctrlElm.parentNode.removeChild(ctrlElm);
      }

      // Remove old item from DOM
      ctrlElm = oldItem.getEl();
      if (ctrlElm) {
        ctrlElm.parentNode.removeChild(ctrlElm);
      }
    }

    // Adopt the item
    newItem.parent(this);
  },

  /**
   * Creates the specified items. If any of the items is plain JSON style objects
   * it will convert these into real tinymce.ui.Control instances.
   *
   * @method create
   * @param {Array} items Array of items to convert into control instances.
   * @return {Array} Array with control instances.
   */
  create (items) {
    const self = this;
    let settings;
    const ctrlItems = [];

    // Non array structure, then force it into an array
    if (!Tools.isArray(items)) {
      items = [items];
    }

    // Add default type to each child control
    Tools.each(items, function (item) {
      if (item) {
        // Construct item if needed
        if (!(item instanceof Control)) {
          // Name only then convert it to an object
          if (typeof item === 'string') {
            item = { type: item };
          }

          // Create control instance based on input settings and default settings
          settings = Tools.extend({}, self.settings.defaults, item);
          item.type = settings.type = settings.type || item.type || self.settings.defaultType ||
            (settings.defaults ? settings.defaults.type : null);
          item = Factory.create(settings);
        }

        ctrlItems.push(item);
      }
    });

    return ctrlItems;
  },

  /**
   * Renders new control instances.
   *
   * @private
   */
  renderNew () {
    const self = this;

    // Render any new items
    self.items().each(function (ctrl, index) {
      let containerElm;

      ctrl.parent(self);

      if (!ctrl.state.get('rendered')) {
        containerElm = self.getEl('body');

        // Insert or append the item
        if (containerElm.hasChildNodes() && index <= containerElm.childNodes.length - 1) {
          $(containerElm.childNodes[index]).before(ctrl.renderHtml());
        } else {
          $(containerElm).append(ctrl.renderHtml());
        }

        ctrl.postRender();
        ReflowQueue.add(ctrl);
      }
    });

    self._layout.applyClasses(self.items().filter(':visible'));
    self._lastRect = null;

    return self;
  },

  /**
   * Appends new instances to the current container.
   *
   * @method append
   * @param {Array/tinymce.ui.Collection} items Array if controls to append.
   * @return {tinymce.ui.Container} Current container instance.
   */
  append (items) {
    return this.add(items).renderNew();
  },

  /**
   * Prepends new instances to the current container.
   *
   * @method prepend
   * @param {Array/tinymce.ui.Collection} items Array if controls to prepend.
   * @return {tinymce.ui.Container} Current container instance.
   */
  prepend (items) {
    const self = this;

    self.items().set(self.create(items).concat(self.items().toArray()));

    return self.renderNew();
  },

  /**
   * Inserts an control at a specific index.
   *
   * @method insert
   * @param {Array/tinymce.ui.Collection} items Array if controls to insert.
   * @param {Number} index Index to insert controls at.
   * @param {Boolean} [before=false] Inserts controls before the index.
   */
  insert (items, index, before) {
    const self = this;
    let curItems, beforeItems, afterItems;

    items = self.create(items);
    curItems = self.items();

    if (!before && index < curItems.length - 1) {
      index += 1;
    }

    if (index >= 0 && index < curItems.length) {
      beforeItems = curItems.slice(0, index).toArray();
      afterItems = curItems.slice(index).toArray();
      curItems.set(beforeItems.concat(items, afterItems));
    }

    return self.renderNew();
  },

  /**
   * Populates the form fields from the specified JSON data object.
   *
   * Control items in the form that matches the data will have it's value set.
   *
   * @method fromJSON
   * @param {Object} data JSON data object to set control values by.
   * @return {tinymce.ui.Container} Current form instance.
   */
  fromJSON (data) {
    const self = this;

    for (const name in data) {
      self.find('#' + name).value(data[name]);
    }

    return self;
  },

  /**
   * Serializes the form into a JSON object by getting all items
   * that has a name and a value.
   *
   * @method toJSON
   * @return {Object} JSON object with form data.
   */
  toJSON () {
    const self = this, data = {};

    self.find('*').each(function (ctrl) {
      const name = ctrl.name(), value = ctrl.value();

      if (name && typeof value !== 'undefined') {
        data[name] = value;
      }
    });

    return data;
  },

  /**
   * Renders the control as a HTML string.
   *
   * @method renderHtml
   * @return {String} HTML representing the control.
   */
  renderHtml () {
    const self = this, layout = self._layout, role = this.settings.role;

    self.preRender();
    layout.preRender(self);

    return (
      '<div id="' + self._id + '" class="' + self.classes + '"' + (role ? ' role="' + this.settings.role + '"' : '') + '>' +
      '<div id="' + self._id + '-body" class="' + self.bodyClasses + '">' +
      (self.settings.html || '') + layout.renderHtml(self) +
      '</div>' +
      '</div>'
    );
  },

  /**
   * Post render method. Called after the control has been rendered to the target.
   *
   * @method postRender
   * @return {tinymce.ui.Container} Current combobox instance.
   */
  postRender () {
    const self = this;
    let box;

    self.items().exec('postRender');
    self._super();

    self._layout.postRender(self);
    self.state.set('rendered', true);

    if (self.settings.style) {
      self.$el.css(self.settings.style);
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

    if (!self.parent()) {
      self.keyboardNav = KeyboardNavigation({
        root: self
      });
    }

    return self;
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
    const self = this, layoutRect = self._super();

    // Recalc container size by asking layout manager
    self._layout.recalc(self);

    return layoutRect;
  },

  /**
   * Recalculates the positions of the controls in the current container.
   * This is invoked by the reflow method and shouldn't be called directly.
   *
   * @method recalc
   */
  recalc () {
    const self = this;
    let rect = self._layoutRect;
    const lastRect = self._lastRect;

    if (!lastRect || lastRect.w !== rect.w || lastRect.h !== rect.h) {
      self._layout.recalc(self);
      rect = self.layoutRect();
      self._lastRect = { x: rect.x, y: rect.y, w: rect.w, h: rect.h };
      return true;
    }
  },

  /**
   * Reflows the current container and it's children and possible parents.
   * This should be used after you for example append children to the current control so
   * that the layout managers know that they need to reposition everything.
   *
   * @example
   * container.append({type: 'button', text: 'My button'}).reflow();
   *
   * @method reflow
   * @return {tinymce.ui.Container} Current container instance.
   */
  reflow () {
    let i;

    ReflowQueue.remove(this);

    if (this.visible()) {
      Control.repaintControls = [];
      Control.repaintControls.map = {};

      this.recalc();
      i = Control.repaintControls.length;

      while (i--) {
        Control.repaintControls[i].repaint();
      }

      // TODO: Fix me!
      if (this.settings.layout !== 'flow' && this.settings.layout !== 'stack') {
        this.repaint();
      }

      Control.repaintControls = [];
    }

    return this;
  }
});