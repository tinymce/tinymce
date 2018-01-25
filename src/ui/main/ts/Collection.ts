/**
 * Collection.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/api/util/Tools';
import Selector from './Selector';
import Class from 'tinymce/core/api/util/Class';

/**
 * Control collection, this class contains control instances and it enables you to
 * perform actions on all the contained items. This is very similar to how jQuery works.
 *
 * @example
 * someCollection.show().disabled(true);
 *
 * @class tinymce.ui.Collection
 */

let Collection, proto;
const push = Array.prototype.push, slice = Array.prototype.slice;

proto = {
  /**
   * Current number of contained control instances.
   *
   * @field length
   * @type Number
   */
  length: 0,

  /**
   * Constructor for the collection.
   *
   * @constructor
   * @method init
   * @param {Array} items Optional array with items to add.
   */
  init (items) {
    if (items) {
      this.add(items);
    }
  },

  /**
   * Adds new items to the control collection.
   *
   * @method add
   * @param {Array} items Array if items to add to collection.
   * @return {tinymce.ui.Collection} Current collection instance.
   */
  add (items) {
    const self = this;

    // Force single item into array
    if (!Tools.isArray(items)) {
      if (items instanceof Collection) {
        self.add(items.toArray());
      } else {
        push.call(self, items);
      }
    } else {
      push.apply(self, items);
    }

    return self;
  },

  /**
   * Sets the contents of the collection. This will remove any existing items
   * and replace them with the ones specified in the input array.
   *
   * @method set
   * @param {Array} items Array with items to set into the Collection.
   * @return {tinymce.ui.Collection} Collection instance.
   */
  set (items) {
    const self = this;
    const len = self.length;
    let i;

    self.length = 0;
    self.add(items);

    // Remove old entries
    for (i = self.length; i < len; i++) {
      delete self[i];
    }

    return self;
  },

  /**
   * Filters the collection item based on the specified selector expression or selector function.
   *
   * @method filter
   * @param {String} selector Selector expression to filter items by.
   * @return {tinymce.ui.Collection} Collection containing the filtered items.
   */
  filter (selector) {
    const self = this;
    let i, l;
    const matches = [];
    let item, match;

    // Compile string into selector expression
    if (typeof selector === 'string') {
      selector = new Selector(selector);

      match = function (item) {
        return selector.match(item);
      };
    } else {
      // Use selector as matching function
      match = selector;
    }

    for (i = 0, l = self.length; i < l; i++) {
      item = self[i];

      if (match(item)) {
        matches.push(item);
      }
    }

    return new Collection(matches);
  },

  /**
   * Slices the items within the collection.
   *
   * @method slice
   * @param {Number} index Index to slice at.
   * @param {Number} len Optional length to slice.
   * @return {tinymce.ui.Collection} Current collection.
   */
  slice () {
    return new Collection(slice.apply(this, arguments));
  },

  /**
   * Makes the current collection equal to the specified index.
   *
   * @method eq
   * @param {Number} index Index of the item to set the collection to.
   * @return {tinymce.ui.Collection} Current collection.
   */
  eq (index) {
    return index === -1 ? this.slice(index) : this.slice(index, +index + 1);
  },

  /**
   * Executes the specified callback on each item in collection.
   *
   * @method each
   * @param {function} callback Callback to execute for each item in collection.
   * @return {tinymce.ui.Collection} Current collection instance.
   */
  each (callback) {
    Tools.each(this, callback);

    return this;
  },

  /**
   * Returns an JavaScript array object of the contents inside the collection.
   *
   * @method toArray
   * @return {Array} Array with all items from collection.
   */
  toArray () {
    return Tools.toArray(this);
  },

  /**
   * Finds the index of the specified control or return -1 if it isn't in the collection.
   *
   * @method indexOf
   * @param {Control} ctrl Control instance to look for.
   * @return {Number} Index of the specified control or -1.
   */
  indexOf (ctrl) {
    const self = this;
    let i = self.length;

    while (i--) {
      if (self[i] === ctrl) {
        break;
      }
    }

    return i;
  },

  /**
   * Returns a new collection of the contents in reverse order.
   *
   * @method reverse
   * @return {tinymce.ui.Collection} Collection instance with reversed items.
   */
  reverse () {
    return new Collection(Tools.toArray(this).reverse());
  },

  /**
   * Returns true/false if the class exists or not.
   *
   * @method hasClass
   * @param {String} cls Class to check for.
   * @return {Boolean} true/false state if the class exists or not.
   */
  hasClass (cls) {
    return this[0] ? this[0].classes.contains(cls) : false;
  },

  /**
   * Sets/gets the specific property on the items in the collection. The same as executing control.<property>(<value>);
   *
   * @method prop
   * @param {String} name Property name to get/set.
   * @param {Object} value Optional object value to set.
   * @return {tinymce.ui.Collection} Current collection instance or value of the first item on a get operation.
   */
  prop (name, value) {
    const self = this;
    let item;

    if (value !== undefined) {
      self.each(function (item) {
        if (item[name]) {
          item[name](value);
        }
      });

      return self;
    }

    item = self[0];

    if (item && item[name]) {
      return item[name]();
    }
  },

  /**
   * Executes the specific function name with optional arguments an all items in collection if it exists.
   *
   * @example collection.exec("myMethod", arg1, arg2, arg3);
   * @method exec
   * @param {String} name Name of the function to execute.
   * @param {Object} ... Multiple arguments to pass to each function.
   * @return {tinymce.ui.Collection} Current collection.
   */
  exec (name) {
    const self = this, args = Tools.toArray(arguments).slice(1);

    self.each(function (item) {
      if (item[name]) {
        item[name].apply(item, args);
      }
    });

    return self;
  },

  /**
   * Remove all items from collection and DOM.
   *
   * @method remove
   * @return {tinymce.ui.Collection} Current collection.
   */
  remove () {
    let i = this.length;

    while (i--) {
      this[i].remove();
    }

    return this;
  },

  /**
   * Adds a class to all items in the collection.
   *
   * @method addClass
   * @param {String} cls Class to add to each item.
   * @return {tinymce.ui.Collection} Current collection instance.
   */
  addClass (cls) {
    return this.each(function (item) {
      item.classes.add(cls);
    });
  },

  /**
   * Removes the specified class from all items in collection.
   *
   * @method removeClass
   * @param {String} cls Class to remove from each item.
   * @return {tinymce.ui.Collection} Current collection instance.
   */
  removeClass (cls) {
    return this.each(function (item) {
      item.classes.remove(cls);
    });
  }

  /**
   * Fires the specified event by name and arguments on the control. This will execute all
   * bound event handlers.
   *
   * @method fire
   * @param {String} name Name of the event to fire.
   * @param {Object} args Optional arguments to pass to the event.
   * @return {tinymce.ui.Collection} Current collection instance.
   */
  // fire: function(event, args) {}, -- Generated by code below

  /**
   * Binds a callback to the specified event. This event can both be
   * native browser events like "click" or custom ones like PostRender.
   *
   * The callback function gets one parameter: either the browser's native event object or a custom JS object.
   *
   * @method on
   * @param {String} name Name of the event to bind. For example "click".
   * @param {String/function} callback Callback function to execute once the event occurs.
   * @return {tinymce.ui.Collection} Current collection instance.
   */
  // on: function(name, callback) {}, -- Generated by code below

  /**
   * Unbinds the specified event and optionally a specific callback. If you omit the name
   * parameter all event handlers will be removed. If you omit the callback all event handles
   * by the specified name will be removed.
   *
   * @method off
   * @param {String} name Optional name for the event to unbind.
   * @param {function} callback Optional callback function to unbind.
   * @return {tinymce.ui.Collection} Current collection instance.
   */
  // off: function(name, callback) {}, -- Generated by code below

  /**
   * Shows the items in the current collection.
   *
   * @method show
   * @return {tinymce.ui.Collection} Current collection instance.
   */
  // show: function() {}, -- Generated by code below

  /**
   * Hides the items in the current collection.
   *
   * @method hide
   * @return {tinymce.ui.Collection} Current collection instance.
   */
  // hide: function() {}, -- Generated by code below

  /**
   * Sets/gets the text contents of the items in the current collection.
   *
   * @method text
   * @return {tinymce.ui.Collection} Current collection instance or text value of the first item on a get operation.
   */
  // text: function(value) {}, -- Generated by code below

  /**
   * Sets/gets the name contents of the items in the current collection.
   *
   * @method name
   * @return {tinymce.ui.Collection} Current collection instance or name value of the first item on a get operation.
   */
  // name: function(value) {}, -- Generated by code below

  /**
   * Sets/gets the disabled state on the items in the current collection.
   *
   * @method disabled
   * @return {tinymce.ui.Collection} Current collection instance or disabled state of the first item on a get operation.
   */
  // disabled: function(state) {}, -- Generated by code below

  /**
   * Sets/gets the active state on the items in the current collection.
   *
   * @method active
   * @return {tinymce.ui.Collection} Current collection instance or active state of the first item on a get operation.
   */
  // active: function(state) {}, -- Generated by code below

  /**
   * Sets/gets the selected state on the items in the current collection.
   *
   * @method selected
   * @return {tinymce.ui.Collection} Current collection instance or selected state of the first item on a get operation.
   */
  // selected: function(state) {}, -- Generated by code below

  /**
   * Sets/gets the selected state on the items in the current collection.
   *
   * @method visible
   * @return {tinymce.ui.Collection} Current collection instance or visible state of the first item on a get operation.
   */
  // visible: function(state) {}, -- Generated by code below
};

// Extend tinymce.ui.Collection prototype with some generated control specific methods
Tools.each('fire on off show hide append prepend before after reflow'.split(' '), function (name) {
  proto[name] = function () {
    const args = Tools.toArray(arguments);

    this.each(function (ctrl) {
      if (name in ctrl) {
        ctrl[name].apply(ctrl, args);
      }
    });

    return this;
  };
});

// Extend tinymce.ui.Collection prototype with some property methods
Tools.each('text name disabled active selected checked visible parent value data'.split(' '), function (name) {
  proto[name] = function (value) {
    return this.prop(name, value);
  };
});

// Create class based on the new prototype
Collection = Class.extend(proto);

// Stick Collection into Selector to prevent circual references
Selector.Collection = Collection;

export default Collection;