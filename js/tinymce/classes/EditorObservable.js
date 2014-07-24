/**
 * EditorObservable.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This mixin contains the event logic for the tinymce.Editor class.
 *
 * @mixin tinymce.EditorObservable
 * @extends tinymce.util.Observable
 */
define("tinymce/EditorObservable", [
	"tinymce/util/Observable",
	"tinymce/dom/DOMUtils",
	"tinymce/util/Tools"
], function(Observable, DOMUtils, Tools) {
	var DOM = DOMUtils.DOM, customEventRootDelegates;

	/**
	 * Returns the event target so for the specified event. Some events fire
	 * only on document, some fire on documentElement etc. This also handles the
	 * custom event root setting where it returns that element instead of the body.
	 *
	 * @private
	 * @param {tinymce.Editor} editor Editor instance to get event target from.
	 * @param {String} eventName Name of the event for example "click".
	 * @return {Element/Document} HTML Element or document target to bind on.
	 */
	function getEventTarget(editor, eventName) {
		if (eventName == 'selectionchange') {
			return editor.getDoc();
		}

		// Need to bind mousedown/mouseup etc to document not body in iframe mode
		// Since the user might click on the HTML element not the BODY
		if (!editor.inline && /^mouse|click|contextmenu|drop|dragover|dragend/.test(eventName)) {
			return editor.getDoc().documentElement;
		}

		// Bind to event root instead of body if it's defined
		if (editor.settings.event_root) {
			if (!editor.eventRoot) {
				editor.eventRoot = DOM.select(editor.settings.event_root)[0];
			}

			return editor.eventRoot;
		}

		return editor.getBody();
	}

	/**
	 * Binds a event delegate for the specified name this delegate will fire
	 * the event to the editor dispatcher.
	 *
	 * @private
	 * @param {tinymce.Editor} editor Editor instance to get event target from.
	 * @param {String} eventName Name of the event for example "click".
	 */
	function bindEventDelegate(editor, eventName) {
		var eventRootElm = getEventTarget(editor, eventName), delegate;

		if (!editor.delegates) {
			editor.delegates = {};
		}

		if (editor.delegates[eventName]) {
			return;
		}

		if (editor.settings.event_root) {
			if (!customEventRootDelegates) {
				customEventRootDelegates = {};
				editor.editorManager.on('removeEditor', function() {
					var name;

					if (!editor.editorManager.activeEditor) {
						if (customEventRootDelegates) {
							for (name in customEventRootDelegates) {
								editor.dom.unbind(getEventTarget(editor, name));
							}

							customEventRootDelegates = null;
						}
					}
				});
			}

			if (customEventRootDelegates[eventName]) {
				return;
			}

			delegate = function(e) {
				var target = e.target, editors = editor.editorManager.editors, i = editors.length;

				while (i--) {
					var body = editors[i].getBody();

					if (body === target || DOM.isChildOf(target, body)) {
						if (!editors[i].hidden) {
							editors[i].fire(eventName, e);
						}
					}
				}
			};

			customEventRootDelegates[eventName] = delegate;
			DOM.bind(eventRootElm, eventName, delegate);
		} else {
			delegate = function(e) {
				if (!editor.hidden) {
					editor.fire(eventName, e);
				}
			};

			DOM.bind(eventRootElm, eventName, delegate);
			editor.delegates[eventName] = delegate;
		}
	}

	var EditorObservable = {
		/**
		 * Bind any pending event delegates. This gets executed after the target body/document is created.
		 *
		 * @private
		 */
		bindPendingEventDelegates: function() {
			var self = this;

			Tools.each(self._pendingNativeEvents, function(name) {
				bindEventDelegate(self, name);
			});
		},

		/**
		 * Toggles a native event on/off this is called by the EventDispatcher when
		 * the first native event handler is added and when the last native event handler is removed.
		 *
		 * @private
		 */
		toggleNativeEvent: function(name, state) {
			var self = this;

			if (self.settings.readonly) {
				return;
			}

			// Never bind focus/blur since the FocusManager fakes those
			if (name == "focus" || name == "blur") {
				return;
			}

			if (state) {
				if (self.initialized) {
					bindEventDelegate(self, name);
				} else {
					if (!self._pendingNativeEvents) {
						self._pendingNativeEvents = [name];
					} else {
						self._pendingNativeEvents.push(name);
					}
				}
			} else if (self.initialized) {
				self.dom.unbind(getEventTarget(self, name), name, self.delegates[name]);
				delete self.delegates[name];
			}
		},

		/**
		 * Unbinds all native event handlers that means delegates, custom events bound using the Events API etc.
		 *
		 * @private
		 */
		unbindAllNativeEvents: function() {
			var self = this, name;

			if (self.delegates) {
				for (name in self.delegates) {
					self.dom.unbind(getEventTarget(self, name), name, self.delegates[name]);
				}

				delete self.delegates;
			}

			if (!self.inline) {
				self.getBody().onload = null;
				self.dom.unbind(self.getWin());
				self.dom.unbind(self.getDoc());
			}

			self.dom.unbind(self.getBody());
			self.dom.unbind(self.getContainer());
		}
	};

	EditorObservable = Tools.extend({}, Observable, EditorObservable);

	return EditorObservable;
});
