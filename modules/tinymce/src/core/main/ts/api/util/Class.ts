/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Obj } from '@ephox/katamari';

import Tools from './Tools';

type WithSubItems<T, K extends keyof T> = T[K] extends Array<any> ? (T & T[K][number]): T;

/**
 * This utility class is used for easier inheritance.
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

export interface Props<A extends any[] = any[]> {
  Mixins?: Array<Record<string, any>>;
  Methods?: string;
  Properties?: string;
  Statics?: Record<string, any>;
  Defaults?: Record<string, any>;

  init?: (...args: A) => void;
}

type ExtendedClass<T extends Props<A>, A extends any[]> = WithSubItems<T, 'Mixins'>;

export interface ExtendedClassConstructor<T extends Props<A>, A extends any[] = any[]> extends Class {
  readonly prototype: ExtendedClass<T, A>;

  new (...args: A): ExtendedClass<T, A>;

  [key: string]: T['Statics'];
}

interface Class {
  extend <T extends Props<A>, A extends any[] = any[]>(props: T): ExtendedClassConstructor<T, A>;
}

// eslint-disable-next-line @tinymce/prefer-fun
const Class: Class = () => {};

// Provides classical inheritance, based on code made by John Resig
Class.extend = extendClass = function <T extends Props<A>, A extends any[]> (props: T): ExtendedClassConstructor<T, A> {
  const self = this;
  const _super = self.prototype;

  // The dummy class constructor
  const Class = function () {
    let i, mixins, mixin;
    const self = this;

    // All construction is actually done in the init method
    if (!initializing) {
      // Run class constructor
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
  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  const createMethod = function (name, fn) {
    return function () {
      const self = this;
      const tmp = self._super;

      self._super = _super[name];
      const ret = fn.apply(self, arguments);
      self._super = tmp;

      return ret;
    };
  };

  // Instantiate a base class (but only create the instance,
  // don't run the init constructor)
  initializing = true;

  /* eslint new-cap:0 */
  const prototype = new self();
  initializing = false;

  // Add mixins
  if (props.Mixins) {
    each(props.Mixins, (mixin) => {
      for (const name in mixin) {
        if (name !== 'init') {
          props[name] = mixin[name];
        }
      }
    });

    if (_super.Mixins) {
      props.Mixins = _super.Mixins.concat(props.Mixins);
    }
  }

  // Generate dummy methods
  if (props.Methods) {
    each(props.Methods.split(','), (name) => {
      props[name] = dummy;
    });
  }

  // Generate property methods
  if (props.Properties) {
    each(props.Properties.split(','), (name) => {
      const fieldName = '_' + name;

      props[name] = function (value) {
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
  if (props.Statics) {
    each(props.Statics, (func, name) => {
      Class[name] = func;
    });
  }

  // Default settings
  if (props.Defaults && _super.Defaults) {
    props.Defaults = extend({}, _super.Defaults, props.Defaults);
  }

  // Copy the properties over onto the new prototype
  Obj.each(props, (member, name) => {
    if (typeof member === 'function' && _super[name]) {
      prototype[name] = createMethod(name, member);
    } else {
      prototype[name] = member;
    }
  });

  // Populate our constructed prototype object
  Class.prototype = prototype;

  // Enforce the constructor to be what we expect
  Class.constructor = Class;

  // And make this class extendable
  Class.extend = extendClass;

  return Class as unknown as ExtendedClassConstructor<T, A>;
};

export default Class;
