import { Obj } from '@ephox/katamari';

import { isReadOnly, processReadonlyEvents } from '../mode/Readonly';
import DOMUtils from './dom/DOMUtils';
import { EventUtilsCallback } from './dom/EventUtils';
import Editor from './Editor';
import { EditorEventMap } from './EventTypes';
import * as Options from './Options';
import Observable from './util/Observable';
import Tools from './util/Tools';

/**
 * This mixin contains the event logic for the tinymce.Editor class.
 *
 * @mixin tinymce.EditorObservable
 * @extends tinymce.util.Observable
 * @private
 */

const DOM = DOMUtils.DOM;
let customEventRootDelegates: Record<string, EventUtilsCallback<any>> | null;

/**
 * Returns the event target for the specified event. Some events fire
 * only on document, some fire on documentElement etc. This also handles the
 * custom event root setting where it returns that element instead of the body.
 *
 * @private
 * @param {tinymce.Editor} editor Editor instance to get event target from.
 * @param {String} eventName Name of the event for example "click".
 * @return {Element/Document} HTML Element or document target to bind on.
 */
const getEventTarget = (editor: Editor, eventName: string): Node => {
  if (eventName === 'selectionchange') {
    return editor.getDoc();
  }

  // Need to bind mousedown/mouseup etc to document not body in iframe mode
  // Since the user might click on the HTML element not the BODY
  if (!editor.inline && /^(?:mouse|touch|click|contextmenu|drop|dragover|dragend)/.test(eventName)) {
    return editor.getDoc().documentElement;
  }

  // Bind to event root instead of body if it's defined
  const eventRoot = Options.getEventRoot(editor);

  if (eventRoot) {
    if (!editor.eventRoot) {
      editor.eventRoot = DOM.select(eventRoot)[0];
    }

    return editor.eventRoot;
  }

  return editor.getBody();
};

const isListening = (editor: Editor) => !editor.hidden && !isReadOnly(editor);

const fireEvent = (editor: Editor, eventName: string, e: Event) => {
  if (isListening(editor)) {
    editor.dispatch(eventName, e);
  } else if (isReadOnly(editor)) {
    processReadonlyEvents(editor, e);
  }
};

/**
 * Binds a event delegate for the specified name this delegate will fire
 * the event to the editor dispatcher.
 *
 * @private
 * @param {tinymce.Editor} editor Editor instance to get event target from.
 * @param {String} eventName Name of the event for example "click".
 */
const bindEventDelegate = (editor: Editor, eventName: string) => {
  if (!editor.delegates) {
    editor.delegates = {};
  }

  if (editor.delegates[eventName] || editor.removed) {
    return;
  }

  const eventRootElm = getEventTarget(editor, eventName);

  if (Options.getEventRoot(editor)) {
    if (!customEventRootDelegates) {
      customEventRootDelegates = {};
      editor.editorManager.on('removeEditor', () => {
        if (!editor.editorManager.activeEditor) {
          if (customEventRootDelegates) {
            Obj.each(customEventRootDelegates, (_value, name) => {
              editor.dom.unbind(getEventTarget(editor, name));
            });

            customEventRootDelegates = null;
          }
        }
      });
    }

    if (customEventRootDelegates[eventName]) {
      return;
    }

    const delegate: EventUtilsCallback<any> = (e) => {
      const target = e.target;
      const editors = editor.editorManager.get();
      let i = editors.length;

      while (i--) {
        const body = editors[i].getBody();

        if (body === target || DOM.isChildOf(target, body)) {
          fireEvent(editors[i], eventName, e);
        }
      }
    };

    customEventRootDelegates[eventName] = delegate;
    DOM.bind(eventRootElm, eventName, delegate);
  } else {
    const delegate: EventUtilsCallback<any> = (e) => {
      fireEvent(editor, eventName, e);
    };

    DOM.bind(eventRootElm, eventName, delegate);
    editor.delegates[eventName] = delegate;
  }
};

interface EditorObservable extends Observable<EditorEventMap> {
  bindPendingEventDelegates (this: Editor): void;
  toggleNativeEvent (this: Editor, name: string, state: boolean): void;
  unbindAllNativeEvents (this: Editor): void;
}

const EditorObservable: EditorObservable = {
  ...Observable,

  /**
   * Bind any pending event delegates. This gets executed after the target body/document is created.
   *
   * @private
   */
  bindPendingEventDelegates() {
    const self = this;

    Tools.each(self._pendingNativeEvents, (name) => {
      bindEventDelegate(self, name);
    });
  },

  /**
   * Toggles a native event on/off this is called by the EventDispatcher when
   * the first native event handler is added and when the last native event handler is removed.
   *
   * @private
   */
  toggleNativeEvent(name, state) {
    const self = this;

    // Never bind focus/blur since the FocusManager fakes those
    if (name === 'focus' || name === 'blur') {
      return;
    }

    // If the editor has been removed, `unbindAllNativeEvents` has already deleted all native event delegates
    if (self.removed) {
      return;
    }

    if (state) {
      if (self.initialized) {
        bindEventDelegate(self, name);
      } else {
        if (!self._pendingNativeEvents) {
          self._pendingNativeEvents = [ name ];
        } else {
          self._pendingNativeEvents.push(name);
        }
      }
    } else if (self.initialized && self.delegates) {
      self.dom.unbind(getEventTarget(self, name), name, self.delegates[name]);
      delete self.delegates[name];
    }
  },

  /**
   * Unbinds all native event handlers that means delegates, custom events bound using the Events API etc.
   *
   * @private
   */
  unbindAllNativeEvents() {
    const self = this;
    const body = self.getBody();
    const dom: DOMUtils = self.dom;

    if (self.delegates) {
      Obj.each(self.delegates, (value, name) => {
        self.dom.unbind(getEventTarget(self, name), name, value);
      });

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

export default EditorObservable;
