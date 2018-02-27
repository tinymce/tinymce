/**
 * Binding.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class gets dynamically extended to provide a binding between two models. This makes it possible to
 * sync the state of two properties in two models by a layer of abstraction.
 *
 * @private
 * @class tinymce.data.Binding
 */

/**
 * Constructs a new bidning.
 *
 * @constructor
 * @method Binding
 * @param {Object} settings Settings to the binding.
 */
const Binding: any = function (settings) {
  this.create = settings.create;
};

/**
 * Creates a binding for a property on a model.
 *
 * @method create
 * @param {tinymce.data.ObservableObject} model Model to create binding to.
 * @param {String} name Name of property to bind.
 * @return {tinymce.data.Binding} Binding instance.
 */
Binding.create = function (model, name) {
  return new Binding({
    create (otherModel, otherName) {
      let bindings;

      const fromSelfToOther = function (e) {
        otherModel.set(otherName, e.value);
      };

      const fromOtherToSelf = function (e) {
        model.set(name, e.value);
      };

      otherModel.on('change:' + otherName, fromOtherToSelf);
      model.on('change:' + name, fromSelfToOther);

      // Keep track of the bindings
      bindings = otherModel._bindings;

      if (!bindings) {
        bindings = otherModel._bindings = [];

        otherModel.on('destroy', function () {
          let i = bindings.length;

          while (i--) {
            bindings[i]();
          }
        });
      }

      bindings.push(function () {
        model.off('change:' + name, fromSelfToOther);
      });

      return model.get(name);
    }
  });
};

export default Binding;