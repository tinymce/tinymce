/**
 * LocalStorage.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class will simulate LocalStorage on IE 7 and return the native version on modern browsers.
 * Storage is done using userData on IE 7 and a special serialization format. The format is designed
 * to be as small as possible by making sure that the keys and values doesn't need to be encoded. This
 * makes it possible to store for example HTML data.
 *
 * Storage format for userData:
 * <base 32 key length>,<key string>,<base 32 value length>,<value>,...
 *
 * For example this data key1=value1,key2=value2 would be:
 * 4,key1,6,value1,4,key2,6,value2
 *
 * @class tinymce.util.LocalStorage
 * @static
 * @version 4.0
 * @example
 * tinymce.util.LocalStorage.setItem('key', 'value');
 * var value = tinymce.util.LocalStorage.getItem('key');
 */
define("tinymce/util/LocalStorage", [], function() {
	var LocalStorage, storageElm, items, keys, userDataKey;

	// Check for native support
	if (window.localStorage) {
		return localStorage;
	}

	userDataKey = "tinymce";
	storageElm = document.documentElement;
	storageElm.addBehavior('#default#userData');

	/**
	 * Gets the keys names and updates LocalStorage.length property. Since IE7 doesn't have any getters/setters.
	 */
	function updateKeys() {
		keys = [];

		for (var key in items) {
			keys.push(key);
		}

		LocalStorage.length = keys.length;
	}

	/**
	 * Loads the userData string and parses it into the items structure.
	 */
	function load() {
		var key, data, value, pos = 0;

		items = {};

		function next(end) {
			var value, nextPos;

			nextPos = end !== undefined ? pos + end : data.indexOf(',', pos);
			if (nextPos === -1 || nextPos > data.length) {
				return null;
			}

			value = data.substring(pos, nextPos);
			pos = nextPos + 1;

			return value;
		}

		storageElm.load(userDataKey);
		data = storageElm.getAttribute(userDataKey) || '';

		do {
			key = next(parseInt(next(), 32) || 0);
			if (key !== null) {
				value = next(parseInt(next(), 32) || 0);
				items[key] = value;
			}
		} while (key !== null);

		updateKeys();
	}

	/**
	 * Saves the items structure into a the userData format.
	 */
	function save() {
		var value, data = '';

		for (var key in items) {
			value = items[key];
			data += (data ? ',' : '') + key.length.toString(32) + ',' + key + ',' + value.length.toString(32) + ',' + value;
		}

		storageElm.setAttribute(userDataKey, data);
		storageElm.save(userDataKey);
		updateKeys();
	}

	LocalStorage = {
		/**
		 * Length of the number of items in storage.
		 *
		 * @property length
		 * @return {Number} Number of items in storage.
		 */
		//length:0,

		/**
		 * Returns the key name by index.
		 *
		 * @method key
		 * @param {Number} index Index of key to return.
		 * @return {String} Key value or null if it wasn't found.
		 */
		key: function(index) {
			return keys[index];
		},

		/**
		 * Returns the value if the specified key or null if it wasn't found.
		 *
		 * @method getItem
		 * @param {String} key Key of item to retrive.
		 * @return {String} Value of the specified item or null if it wasn't found.
		 */
		getItem: function(key) {
			return key in items ? items[key] : null;
		},

		/**
		 * Sets the value of the specified item by it's key.
		 *
		 * @method setItem
		 * @param {String} key Key of the item to set.
		 * @param {String} value Value of the item to set.
		 */
		setItem: function(key, value) {
			items[key] = "" + value;
			save();
		},

		/**
		 * Removes the specified item by key.
		 *
		 * @method removeItem
		 * @param {String} key Key of item to remove.
		 */
		removeItem: function(key) {
			delete items[key];
			save();
		},

		/**
		 * Removes all items.
		 *
		 * @method clear
		 */
		clear: function() {
			items = {};
			save();
		}
	};

	load();

	return LocalStorage;
});