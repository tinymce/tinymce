/**
 * Observable.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define("tinymce/util/Observable", [
	"tinymce/util/Tools"
], function(Tools) {
	var bindingsName = "__bindings";
	var nativeEvents = Tools.makeMap(
		"focusin focusout click dblclick mousedown mouseup mousemove mouseover beforepaste paste cut copy selectionchange" +
		" mouseout mouseenter mouseleave keydown keypress keyup contextmenu dragend dragover draggesture dragdrop drop drag", ' '
	);

	function returnFalse() {
		return false;
	}

	function returnTrue() {
		return true;
	}

	return {
		fire: function(name, args, bubble) {
			var self = this, handlers, i, l, callback, parent;

			name = name.toLowerCase();
			args = args || {};
			args.type = name;

			// Setup target is there isn't one
			if (!args.target) {
				args.target = self;
			}

			// Add event delegation methods if they are missing
			if (!args.preventDefault) {
				// Add preventDefault method
				args.preventDefault = function() {
					args.isDefaultPrevented = returnTrue;
				};

				// Add stopPropagation
				args.stopPropagation = function() {
					args.isPropagationStopped = returnTrue;
				};

				// Add stopImmediatePropagation
				args.stopImmediatePropagation = function() {
					args.isImmediatePropagationStopped = returnTrue;
				};

				// Add event delegation states
				args.isDefaultPrevented = returnFalse;
				args.isPropagationStopped = returnFalse;
				args.isImmediatePropagationStopped = returnFalse;
			}

			//console.log(name, args);

			if (self[bindingsName]) {
				handlers = self[bindingsName][name];

				if (handlers) {
					for (i = 0, l = handlers.length; i < l; i++) {
						handlers[i] = callback = handlers[i];

						// Stop immediate propagation if needed
						if (args.isImmediatePropagationStopped()) {
							break;
						}

						// If callback returns false then prevent default and stop all propagation
						if (callback.call(self, args) === false) {
							args.preventDefault();
							return args;
						}
					}
				}
			}

			// Bubble event up to parents
			if (bubble !== false && self.parent) {
				parent = self.parent();
				while (parent && !args.isPropagationStopped()) {
					parent.fire(name, args, false);
					parent = parent.parent();
				}
			}

			return args;
		},

		on: function(name, callback) {
			var self = this, bindings, handlers, names, i;

			if (callback === false) {
				callback = function() {
					return false;
				};
			}

			if (callback) {
				names = name.toLowerCase().split(' ');
				i = names.length;
				while (i--) {
					name = names[i];

					bindings = self[bindingsName];
					if (!bindings) {
						bindings = self[bindingsName] = {};
					}

					handlers = bindings[name];
					if (!handlers) {
						handlers = bindings[name] = [];
						if (self.bindNative && nativeEvents[name]) {
							self.bindNative(name);
						}
					}

					handlers.push(callback);
				}
			}

			return self;
		},

		off: function(name, callback) {
			var self = this, i, bindings = self[bindingsName], handlers, bindingName, names, hi;

			if (bindings) {
				if (name) {
					names = name.toLowerCase().split(' ');
					i = names.length;
					while (i--) {
						name = names[i];
						handlers = bindings[name];

						// Unbind all handlers
						if (!name) {
							for (bindingName in bindings) {
								bindings[name].length = 0;
							}

							return self;
						}

						if (handlers) {
							// Unbind all by name
							if (!callback) {
								handlers.length = 0;
							} else {
								// Unbind specific ones
								hi = handlers.length;
								while (hi--) {
									if (handlers[hi] === callback) {
										handlers.splice(hi, 1);
									}
								}
							}

							if (!handlers.length && self.unbindNative && nativeEvents[name]) {
								self.unbindNative(name);
								delete bindings[name];
							}
						}
					}
				} else {
					if (self.unbindNative) {
						for (name in bindings) {
							self.unbindNative(name);
						}
					}

					self[bindingsName] = [];
				}
			}

			return self;
		}
	};
});