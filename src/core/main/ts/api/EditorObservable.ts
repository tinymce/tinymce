/**
 * EditorObservable.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Observable from './util/Observable';
import DOMUtils from './dom/DOMUtils';
import Tools from './util/Tools';
import { Editor } from 'tinymce/core/api/Editor';

/**
 * This mixin contains the event logic for the tinymce.Editor class.
 *
 * @mixin tinymce.EditorObservable
 * @extends tinymce.util.Observable
 */

const DOM = DOMUtils.DOM;
let customEventRootDelegates;

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
const getEventTarget = function (editor, eventName) {
  if (eventName === 'selectionchange') {
    return editor.getDoc();
  }

  // Need to bind mousedown/mouseup etc to document not body in iframe mode
  // Since the user might click on the HTML element not the BODY
  if (!editor.inline && /^mouse|touch|click|contextmenu|drop|dragover|dragend/.test(eventName)) {
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
};

/**
 * Binds a event delegate for the specified name this delegate will fire
 * the event to the editor dispatcher.
 *
 * @private
 * @param {tinymce.Editor} editor Editor instance to get event target from.
 * @param {String} eventName Name of the event for example "click".
 */
const bindEventDelegate = function (editor: Editor, eventName) {
  let eventRootElm, delegate;

  const isListening = function (editor) {
    return !editor.hidden && !editor.readonly;
  };

  if (!editor.delegates) {
    editor.delegates = {};
  }

  if (editor.delegates[eventName] || editor.removed) {
    return;
  }

  eventRootElm = getEventTarget(editor, eventName);

  if (editor.settings.event_root) {
    if (!customEventRootDelegates) {
      customEventRootDelegates = {};
      editor.editorManager.on('removeEditor', function () {
        let name;

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

    delegate = function (e) {
      const target = e.target;
      const editors = editor.editorManager.get();
      let i = editors.length;

      while (i--) {
        const body = editors[i].getBody();

        if (body === target || DOM.isChildOf(target, body)) {
          if (isListening(editors[i])) {
            editors[i].fire(eventName, e);
          }
        }
      }
    };

    customEventRootDelegates[eventName] = delegate;
    DOM.bind(eventRootElm, eventName, delegate);
  } else {
    delegate = function (e) {
      if (isListening(editor)) {
        editor.fire(eventName, e);
      }
    };

    DOM.bind(eventRootElm, eventName, delegate);
    editor.delegates[eventName] = delegate;
  }
};

let EditorObservable = {
  /**
   * Bind any pending event delegates. This gets executed after the target body/document is created.
   *
   * @private
   */
  bindPendingEventDelegates () {
    const self = this;

    Tools.each(self._pendingNativeEvents, function (name) {
      bindEventDelegate(self, name);
    });
  },

  /**
   * Toggles a native event on/off this is called by the EventDispatcher when
   * the first native event handler is added and when the last native event handler is removed.
   *
   * @private
   */
  toggleNativeEvent (name, state) {
    const self = this;

    // Never bind focus/blur since the FocusManager fakes those
    if (name === 'focus' || name === 'blur') {
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
  unbindAllNativeEvents () {
    const self = this;
    const body = self.getBody();
    const dom: DOMUtils = self.dom;
    let name;

    if (self.delegates) {
      for (name in self.delegates) {
        self.dom.unbind(getEventTarget(self, name), name, self.delegates[name]);
      }

      delete self.delegates;
    }

    if (!self.inline && body && dom) {
      body.onload = null;
      dom.unbind(self.getWin());
      dom.unbind(self.getDoc());
    }

    if (dom) {
      dom.unbind(body);
      dom.unbind(self.getContainer());
    }
  }
};

EditorObservable = Tools.extend({}, Observable, EditorObservable);

export default EditorObservable;