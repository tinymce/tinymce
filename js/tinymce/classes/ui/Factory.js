/**
 * Factory.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

/**
 * This class is a factory for control instances. This enables you
 * to create instances of controls without having to require the UI controls directly.
 *
 * It also allow you to override or add new control types.
 *
 * @class tinymce.ui.Factory
 */
define("tinymce/ui/Factory", [], function() {
	"use strict";

	var types = {}, namespaceInit;

	return {
		/**
		 * Adds a new control instance type to the factory.
		 *
		 * @method add
		 * @param {String} type Type name for example "button".
		 * @param {function} typeClass Class type function.
		 */
		add: function(type, typeClass) {
			types[type.toLowerCase()] = typeClass;
		},

		/**
		 * Returns true/false if the specified type exists or not.
		 *
		 * @method has
		 * @param {String} type Type to look for.
		 * @return {Boolean} true/false if the control by name exists.
		 */
		has: function(type) {
			return !!types[type.toLowerCase()];
		},

		/**
		 * Creates a new control instance based on the settings provided. The instance created will be
		 * based on the specified type property it can also create whole structures of components out of
		 * the specified JSON object.
		 *
		 * @example
		 * tinymce.ui.Factory.create({
		 *     type: 'button',
		 *     text: 'Hello world!'
		 * });
		 *
		 * @method create
		 * @param {Object/String} settings Name/Value object with items used to create the type.
		 * @return {tinymce.ui.Control} Control instance based on the specified type.
		 */
		create: function(type, settings) {
			var ControlType, name, namespace;

			// Build type lookup
			if (!namespaceInit) {
				namespace = tinymce.ui;

				for (name in namespace) {
					types[name.toLowerCase()] = namespace[name];
				}

				namespaceInit = true;
			}

			// If string is specified then use it as the type
			if (typeof(type) == 'string') {
				settings = settings || {};
				settings.type = type;
			} else {
				settings = type;
				type = settings.type;
			}

			// Find control type
			type = type.toLowerCase();
			ControlType = types[type];

			// #if debug

			if (!ControlType) {
				throw new Error("Could not find control by type: " + type);
			}

			// #endif

			ControlType = new ControlType(settings);
			ControlType.type = type; // Set the type on the instance, this will be used by the Selector engine

			return ControlType;
		}
	};
});