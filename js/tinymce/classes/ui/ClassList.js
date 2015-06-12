/**
 * ClassList.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Handles adding and removal of classes.
 *
 * @class tinymce.ui.ClassList
 */
define("tinymce/ui/ClassList", [
	"tinymce/util/Tools"
], function(Tools) {
	"use strict";

	function noop() {
	}

	/**
	 * Constructs a new class list the specified onchange
	 * callback will be executed when the class list gets modifed.
	 *
	 * @constructor ClassList
	 * @param {function} onchange Onchange callback to be executed.
	 */
	function ClassList(onchange) {
		this.cls = [];
		this.cls._map = {};
		this.onchange = onchange || noop;
		this.prefix = '';
	}

	Tools.extend(ClassList.prototype, {
		/**
		 * Adds a new class to the class list.
		 *
		 * @method add
		 * @param {String} cls Class to be added.
		 * @return {tinymce.ui.ClassList} Current class list instance.
		 */
		add: function(cls) {
			if (cls && !this.contains(cls)) {
				this.cls._map[cls] = true;
				this.cls.push(cls);
				this._change();
			}

			return this;
		},

		/**
		 * Removes the specified class from the class list.
		 *
		 * @method remove
		 * @param {String} cls Class to be removed.
		 * @return {tinymce.ui.ClassList} Current class list instance.
		 */
		remove: function(cls) {
			if (this.contains(cls)) {
				for (var i = 0; i < this.cls.length; i++) {
					if (this.cls[i] === cls) {
						break;
					}
				}

				this.cls.splice(i, 1);
				delete this.cls._map[cls];
				this._change();
			}

			return this;
		},

		/**
		 * Toggles a class in the class list.
		 *
		 * @method toggle
		 * @param {String} cls Class to be added/removed.
		 * @param {Boolean} state Optional state if it should be added/removed.
		 * @return {tinymce.ui.ClassList} Current class list instance.
		 */
		toggle: function(cls, state) {
			var curState = this.contains(cls);

			if (curState !== state) {
				if (curState) {
					this.remove(cls);
				} else {
					this.add(cls);
				}

				this._change();
			}

			return this;
		},

		/**
		 * Returns true if the class list has the specified class.
		 *
		 * @method contains
		 * @param {String} cls Class to look for.
		 * @return {Boolean} true/false if the class exists or not.
		 */
		contains: function(cls) {
			return !!this.cls._map[cls];
		},

		/**
		 * Returns a space separated list of classes.
		 *
		 * @method toString
		 * @return {String} Space separated list of classes.
		 */

		_change: function() {
			delete this.clsValue;
			this.onchange.call(this);
		}
	});

	// IE 8 compatibility
	ClassList.prototype.toString = function() {
		var value;

		if (this.clsValue) {
			return this.clsValue;
		}

		value = '';
		for (var i = 0; i < this.cls.length; i++) {
			if (i > 0) {
				value += ' ';
			}

			value += this.prefix + this.cls[i];
		}

		return value;
	};

	return ClassList;
});