/**
 * Observable.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This mixin will add event binding logic to classes.
 *
 * @mixin tinymce.util.Observable
 */
define("tinymce/util/Observable", [
	"tinymce/util/EventDispatcher"
], function(EventDispatcher) {
	function getEventDispatcher(obj) {
		if (!obj._eventDispatcher) {
			obj._eventDispatcher = new EventDispatcher({
				scope: obj,
				toggleEvent: function(name, state) {
					if (EventDispatcher.isNative(name) && obj.toggleNativeEvent) {
						obj.toggleNativeEvent(name, state);
					}
				}
			});
		}

		return obj._eventDispatcher;
	}

	return {
		/**
		 * Fires the specified event by name. Consult the
		 * <a href="/docs/advanced/events">event reference</a> for more details on each event.
		 *
		 * @method fire
		 * @param {String} name Name of the event to fire.
		 * @param {Object?} args Event arguments.
		 * @param {Boolean?} bubble True/false if the event is to be bubbled.
		 * @return {Object} Event args instance passed in.
		 * @example
		 * instance.fire('event', {...});
		 */
		fire: function(name, args, bubble) {
			var self = this;

			// Prevent all events except the remove event after the instance has been removed
			if (self.removed && name !== "remove") {
				return args;
			}

			args = getEventDispatcher(self).fire(name, args, bubble);

			// Bubble event up to parents
			if (bubble !== false && self.parent) {
				var parent = self.parent();
				while (parent && !args.isPropagationStopped()) {
					parent.fire(name, args, false);
					parent = parent.parent();
				}
			}

			return args;
		},

		/**
		 * Binds an event listener to a specific event by name. Consult the
		 * <a href="/docs/advanced/events">event reference</a> for more details on each event.
		 *
		 * @method on
		 * @param {String} name Event name or space separated list of events to bind.
		 * @param {callback} callback Callback to be executed when the event occurs.
		 * @param {Boolean} first Optional flag if the event should be prepended. Use this with care.
		 * @return {Object} Current class instance.
		 * @example
		 * instance.on('event', function(e) {
		 *     // Callback logic
		 * });
		 */
		on: function(name, callback, prepend) {
			return getEventDispatcher(this).on(name, callback, prepend);
		},

		/**
		 * Unbinds an event listener to a specific event by name. Consult the
		 * <a href="/docs/advanced/events">event reference</a> for more details on each event.
		 *
		 * @method off
		 * @param {String?} name Name of the event to unbind.
		 * @param {callback?} callback Callback to unbind.
		 * @return {Object} Current class instance.
		 * @example
		 * // Unbind specific callback
		 * instance.off('event', handler);
		 *
		 * // Unbind all listeners by name
		 * instance.off('event');
		 *
		 * // Unbind all events
		 * instance.off();
		 */
		off: function(name, callback) {
			return getEventDispatcher(this).off(name, callback);
		},

		/**
		 * Bind the event callback and once it fires the callback is removed. Consult the
		 * <a href="/docs/advanced/events">event reference</a> for more details on each event.
		 *
		 * @method once
		 * @param {String} name Name of the event to bind.
		 * @param {callback} callback Callback to bind only once.
		 * @return {Object} Current class instance.
		 */
		once: function(name, callback) {
			return getEventDispatcher(this).once(name, callback);
		},

		/**
		 * Returns true/false if the object has a event of the specified name.
		 *
		 * @method hasEventListeners
		 * @param {String} name Name of the event to check for.
		 * @return {Boolean} true/false if the event exists or not.
		 */
		hasEventListeners: function(name) {
			return getEventDispatcher(this).has(name);
		}
	};
});