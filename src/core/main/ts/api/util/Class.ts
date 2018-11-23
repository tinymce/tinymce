/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Tools from './Tools';

/**
 * This utilitiy class is used for easier inheritance.
 *
 * Features:
 * * Exposed super functions: this._super();
 * * Mixins
 * * Dummy functions
 * * Property functions: var value = object.value(); and object.value(newValue);
 * * Static functions
 * * Defaults settings
 */

const each = Tools.each, extend = Tools.extend;

let extendClass, initializing;

const Class: any = function () {
};

// Provides classical inheritance, based on code made by John Resig
Class.extend = extendClass = function (prop) {
  const self = this;
  const _super = self.prototype;
  let prototype, name, member;

  // The dummy class constructor
  const Class: any = function () {
    let i, mixins, mixin;
    const self = this;

    // All construction is actually done in the init method
    if (!initializing) {
      // Run class constuctor
      if (self.init) {
        self.init.apply(self, arguments);
      }

      // Run mixin constructors
      mixins = self.Mixins;
      if (mixins) {
        i = mixins.length;
        while (i--) {
          mixin = mixins[i];
          if (mixin.init) {
            mixin.init.apply(self, arguments);
          }
        }
      }
    }
  };

  // Dummy function, needs to be extended in order to provide functionality
  const dummy = function () {
    return this;
  };

  // Creates a overloaded method for the class
  // this enables you to use this._super(); to call the super function
  const createMethod = function (name, fn) {
    return function () {
      const self = this;
      const tmp = self._super;
      let ret;

      self._super = _super[name];
      ret = fn.apply(self, arguments);
      self._super = tmp;

      return ret;
    };
  };

  // Instantiate a base class (but only create the instance,
  // don't run the init constructor)
  initializing = true;

  /*eslint new-cap:0 */
  prototype = new self();
  initializing = false;

  // Add mixins
  if (prop.Mixins) {
    each(prop.Mixins, function (mixin) {
      for (const name in mixin) {
        if (name !== 'init') {
          prop[name] = mixin[name];
        }
      }
    });

    if (_super.Mixins) {
      prop.Mixins = _super.Mixins.concat(prop.Mixins);
    }
  }

  // Generate dummy methods
  if (prop.Methods) {
    each(prop.Methods.split(','), function (name) {
      prop[name] = dummy;
    });
  }

  // Generate property methods
  if (prop.Properties) {
    each(prop.Properties.split(','), function (name) {
      const fieldName = '_' + name;

      prop[name] = function (value) {
        const self = this;

        // Set value
        if (value !== undefined) {
          self[fieldName] = value;

          return self;
        }

        // Get value
        return self[fieldName];
      };
    });
  }

  // Static functions
  if (prop.Statics) {
    each(prop.Statics, function (func, name) {
      Class[name] = func;
    });
  }

  // Default settings
  if (prop.Defaults && _super.Defaults) {
    prop.Defaults = extend({}, _super.Defaults, prop.Defaults);
  }

  // Copy the properties over onto the new prototype
  for (name in prop) {
    member = prop[name];

    if (typeof member === 'function' && _super[name]) {
      prototype[name] = createMethod(name, member);
    } else {
      prototype[name] = member;
    }
  }

  // Populate our constructed prototype object
  Class.prototype = prototype;

  // Enforce the constructor to be what we expect
  Class.constructor = Class;

  // And make this class extendible
  Class.extend = extendClass;

  return Class;
};

export default Class;