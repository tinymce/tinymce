/**
 * Factory.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/*global tinymce:true */

/**
 * ..
 *
 * @class tinymce.ui.Factory
 */
define("tinymce/ui/Factory", [], function() {
	"use strict";

	var types = {}, namespaceInit;

	return {
		add: function(type, typeClass) {
			types[type.toLowerCase()] = typeClass;
		},

		has: function(type) {
			return !!types[type.toLowerCase()];
		},

		/**
		 * Creates a new control instance based on the settings provided. The instance created will be
		 * based on the specified type property.
		 *
		 * @method create
		 * @example tinymce.ui.Factory.create({type: 'button', text: 'Hello world!'});
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