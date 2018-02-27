/**
 * ObservableObject.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Binding from './Binding';
import Class from 'tinymce/core/api/util/Class';
import Observable from 'tinymce/core/api/util/Observable';
import Tools from 'tinymce/core/api/util/Tools';

/**
 * This class is a object that is observable when properties changes a change event gets emitted.
 *
 * @private
 * @class tinymce.data.ObservableObject
 */

function isNode(node) {
  return node.nodeType > 0;
}

// Todo: Maybe this should be shallow compare since it might be huge object references
function isEqual(a, b) {
  let k, checked;

  // Strict equals
  if (a === b) {
    return true;
  }

  // Compare null
  if (a === null || b === null) {
    return a === b;
  }

  // Compare number, boolean, string, undefined
  if (typeof a !== 'object' || typeof b !== 'object') {
    return a === b;
  }

  // Compare arrays
  if (Tools.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }

    k = a.length;
    while (k--) {
      if (!isEqual(a[k], b[k])) {
        return false;
      }
    }
  }

  // Shallow compare nodes
  if (isNode(a) || isNode(b)) {
    return a === b;
  }

  // Compare objects
  checked = {};
  for (k in b) {
    if (!isEqual(a[k], b[k])) {
      return false;
    }

    checked[k] = true;
  }

  for (k in a) {
    if (!checked[k] && !isEqual(a[k], b[k])) {
      return false;
    }
  }

  return true;
}

export default Class.extend({
  Mixins: [Observable],

  /**
   * Constructs a new observable object instance.
   *
   * @constructor
   * @param {Object} data Initial data for the object.
   */
  init (data) {
    let name, value;

    data = data || {};

    for (name in data) {
      value = data[name];

      if (value instanceof Binding) {
        data[name] = value.create(this, name);
      }
    }

    this.data = data;
  },

  /**
   * Sets a property on the value this will call
   * observers if the value is a change from the current value.
   *
   * @method set
   * @param {String/object} name Name of the property to set or a object of items to set.
   * @param {Object} value Value to set for the property.
   * @return {tinymce.data.ObservableObject} Observable object instance.
   */
  set (name, value) {
    let key, args;
    const oldValue = this.data[name];

    if (value instanceof Binding) {
      value = value.create(this, name);
    }

    if (typeof name === 'object') {
      for (key in name) {
        this.set(key, name[key]);
      }

      return this;
    }

    if (!isEqual(oldValue, value)) {
      this.data[name] = value;

      args = {
        target: this,
        name,
        value,
        oldValue
      };

      this.fire('change:' + name, args);
      this.fire('change', args);
    }

    return this;
  },

  /**
   * Gets a property by name.
   *
   * @method get
   * @param {String} name Name of the property to get.
   * @return {Object} Object value of propery.
   */
  get (name) {
    return this.data[name];
  },

  /**
   * Returns true/false if the specified property exists.
   *
   * @method has
   * @param {String} name Name of the property to check for.
   * @return {Boolean} true/false if the item exists.
   */
  has (name) {
    return name in this.data;
  },

  /**
   * Returns a dynamic property binding for the specified property name. This makes
   * it possible to sync the state of two properties in two ObservableObject instances.
   *
   * @method bind
   * @param {String} name Name of the property to sync with the property it's inserted to.
   * @return {tinymce.data.Binding} Data binding instance.
   */
  bind (name) {
    return Binding.create(this, name);
  },

  /**
   * Destroys the observable object and fires the "destroy"
   * event and clean up any internal resources.
   *
   * @method destroy
   */
  destroy () {
    this.fire('destroy');
  }
});