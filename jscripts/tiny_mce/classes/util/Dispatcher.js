/**
 * Dispatcher.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class is used to dispatch event to observers/listeners.
 * All internal events inside TinyMCE uses this class.
 *
 * @class tinymce.util.Dispatcher
 * @example
 * // Creates a custom event
 * this.onSomething = new tinymce.util.Dispatcher(this);
 * 
 * // Dispatch/fire the event
 * this.onSomething.dispatch('some string');
 */
tinymce.create('tinymce.util.Dispatcher', {
	scope : null,
	listeners : null,
	inDispatch: false,

	/**
	 * Constructs a new event dispatcher object.
	 *
	 * @constructor
	 * @method Dispatcher
	 * @param {Object} scope Optional default execution scope for all observer functions.
	 */
	Dispatcher : function(scope) {
		this.scope = scope || this;
		this.listeners = [];
	},

	/**
	 * Add an observer function to be executed when a dispatch call is done.
	 *
	 * @method add
	 * @param {function} callback Callback function to execute when a dispatch event occurs.
	 * @param {Object} s Optional execution scope, defaults to the one specified in the class constructor.
	 * @return {function} Returns the same function as the one passed on.
	 */
	add : function(callback, scope) {
		this.listeners.push({cb : callback, scope : scope || this.scope});

		return callback;
	},

	/**
	 * Add an observer function to be executed to the top of the list of observers.
	 *
	 * @method addToTop
	 * @param {function} callback Callback function to execute when a dispatch event occurs.
	 * @param {Object} scope Optional execution scope, defaults to the one specified in the class constructor.
	 * @return {function} Returns the same function as the one passed on.
	 */
	addToTop : function(callback, scope) {
		var self = this, listener = {cb : callback, scope : scope || self.scope};

		// Create new listeners if addToTop is executed in a dispatch loop
		if (self.inDispatch) {
			self.listeners = [listener].concat(self.listeners);
		} else {
			self.listeners.unshift(listener);
		}

		return callback;
	},

	/**
	 * Removes an observer function.
	 *
	 * @method remove
	 * @param {function} callback Observer function to remove.
	 * @return {function} The same function that got passed in or null if it wasn't found.
	 */
	remove : function(callback) {
		var listeners = this.listeners, output = null;

		tinymce.each(listeners, function(listener, i) {
			if (callback == listener.cb) {
				output = listener;
				listeners.splice(i, 1);
				return false;
			}
		});

		return output;
	},

	/**
	 * Dispatches an event to all observers/listeners.
	 *
	 * @method dispatch
	 * @param {Object} .. Any number of arguments to dispatch.
	 * @return {Object} Last observer functions return value.
	 */
	dispatch : function() {
		var self = this, returnValue, args = arguments, i, listeners = self.listeners, listener;

		self.inDispatch = true;
		
		// Needs to be a real loop since the listener count might change while looping
		// And this is also more efficient
		for (i = 0; i < listeners.length; i++) {
			listener = listeners[i];
			returnValue = listener.cb.apply(listener.scope, args.length > 0 ? args : [listener.scope]);

			if (returnValue === false)
				break;
		}

		self.inDispatch = false;

		return returnValue;
	}

	/**#@-*/
});
