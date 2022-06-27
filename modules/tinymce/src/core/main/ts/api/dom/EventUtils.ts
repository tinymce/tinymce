import { Obj, Type } from '@ephox/katamari';

import * as NodeType from '../../dom/NodeType';
import * as Utils from '../../events/EventUtils';

export type EventUtilsCallback<T> = (event: EventUtilsEvent<T>) => void | boolean;
export type EventUtilsEvent<T> = Utils.NormalizedEvent<T> & {
  metaKey: boolean;
};

interface PartialEvent extends Utils.PartialEvent {
  readonly type: string;
}

interface ReadyEvent {
  readonly type: string;
}

interface Callback<T> {
  func: EventUtilsCallback<T>;
  scope: any;
}

interface CallbackList<T> extends Array<Callback<T>> {
  fakeName: string | false;
  capture: boolean;
  nativeHandler: EventListener;
}

/**
 * This class wraps the browsers native event logic with more convenient methods.
 *
 * @class tinymce.dom.EventUtils
 */

const eventExpandoPrefix = 'mce-data-';
const mouseEventRe = /^(?:mouse|contextmenu)|click/;

/**
 * Binds a native event to a callback on the speified target.
 */
const addEvent = (target: EventTarget, name: string, callback: EventListenerOrEventListenerObject, capture?: boolean) => {
  target.addEventListener(name, callback, capture || false);
};

/**
 * Unbinds a native event callback on the specified target.
 */
const removeEvent = (target: EventTarget, name: string, callback: EventListenerOrEventListenerObject, capture?: boolean) => {
  target.removeEventListener(name, callback, capture || false);
};

const isMouseEvent = (event: PartialEvent | null): event is MouseEvent =>
  Type.isNonNullable(event) && mouseEventRe.test(event.type);

/**
 * Normalizes a native event object or just adds the event specific methods on a custom event.
 */
const fix = <T extends PartialEvent> (originalEvent: T, data?: Partial<T>): EventUtilsEvent<T> => {
  const event = Utils.normalize<Partial<T>>(originalEvent.type, originalEvent, document, data) as EventUtilsEvent<T>;

  // Calculate pageX/Y if missing and clientX/Y available
  if (isMouseEvent(originalEvent) && Type.isUndefined(originalEvent.pageX) && !Type.isUndefined(originalEvent.clientX)) {
    const eventDoc = event.target.ownerDocument || document;
    const doc = eventDoc.documentElement;
    const body = eventDoc.body;
    const mouseEvent = event as EventUtilsEvent<T> & { pageX: number; pageY: number };

    mouseEvent.pageX = originalEvent.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
      (doc && doc.clientLeft || body && body.clientLeft || 0);

    mouseEvent.pageY = originalEvent.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) -
      (doc && doc.clientTop || body && body.clientTop || 0);
  }

  return event;
};

/**
 * Bind a DOMContentLoaded event across browsers and executes the callback once the page DOM is initialized.
 * It will also set/check the domLoaded state of the event_utils instance so ready isn't called multiple times.
 */
const bindOnReady = (win: Window, callback: (event: ReadyEvent) => void, eventUtils: EventUtils) => {
  const doc = win.document, event = { type: 'ready' };

  if (eventUtils.domLoaded) {
    callback(event);
    return;
  }

  const isDocReady = () => {
    // Check complete or interactive state if there is a body
    // element on some iframes IE 8 will produce a null body
    return doc.readyState === 'complete' || (doc.readyState === 'interactive' && doc.body);
  };

  // Gets called when the DOM is ready
  const readyHandler = () => {
    removeEvent(win, 'DOMContentLoaded', readyHandler);
    removeEvent(win, 'load', readyHandler);

    if (!eventUtils.domLoaded) {
      eventUtils.domLoaded = true;
      callback(event);
    }

    // Clean memory for IE
    win = null as any;
  };

  if (isDocReady()) {
    readyHandler();
  } else {
    addEvent(win, 'DOMContentLoaded', readyHandler);
  }

  // Fallback if any of the above methods should fail for some odd reason
  if (!eventUtils.domLoaded) {
    addEvent(win, 'load', readyHandler);
  }
};

export interface EventUtilsConstructor {
  readonly prototype: EventUtils;

  new (): EventUtils;

  Event: EventUtils;
}

/**
 * This class enables you to bind/unbind native events to elements and normalize it's behavior across browsers.
 */
class EventUtils {
  public static Event: EventUtils = new EventUtils();

  // State if the DOMContentLoaded was executed or not
  public domLoaded: boolean = false;
  public events: Record<number, Record<string, CallbackList<any>>> = {};

  private readonly expando;
  private hasFocusIn: boolean;
  private count: number = 1;

  public constructor() {
    this.expando = eventExpandoPrefix + (+new Date()).toString(32);
    this.hasFocusIn = 'onfocusin' in document.documentElement;
    this.count = 1;
  }

  /**
   * Binds a callback to an event on the specified target.
   *
   * @method bind
   * @param {Object} target Target node/window or custom object.
   * @param {String} name Name of the event to bind.
   * @param {Function} callback Callback function to execute when the event occurs.
   * @param {Object} scope Scope to call the callback function on, defaults to target.
   * @return {Function} Callback function that got bound.
   */
  public bind <K extends keyof HTMLElementEventMap>(target: any, name: K, callback: EventUtilsCallback<HTMLElementEventMap[K]>, scope?: any): EventUtilsCallback<HTMLElementEventMap[K]>;
  public bind <T = any>(target: any, names: string, callback: EventUtilsCallback<T>, scope?: any): EventUtilsCallback<T>;
  public bind(target: any, names: string, callback: EventUtilsCallback<any>, scope?: any): EventUtilsCallback<any> {
    const self = this;
    let callbackList: CallbackList<any> | null | undefined;
    const win = window;

    // Native event handler function patches the event and executes the callbacks for the expando
    const defaultNativeHandler = (evt: PartialEvent): void => {
      self.executeHandlers(fix(evt || win.event), id);
    };

    // Don't bind to text nodes or comments
    if (!target || NodeType.isText(target) || NodeType.isComment(target)) {
      return callback;
    }

    // Create or get events id for the target
    let id: number;
    if (!target[self.expando]) {
      id = self.count++;
      target[self.expando] = id;
      self.events[id] = {};
    } else {
      id = target[self.expando];
    }

    // Setup the specified scope or use the target as a default
    scope = scope || target;

    // Split names and bind each event, enables you to bind multiple events with one call
    const namesList = names.split(' ');
    let i = namesList.length;
    while (i--) {
      let name = namesList[i];
      let nativeHandler = defaultNativeHandler;
      let capture = false;
      let fakeName: string | false = false;

      // Use ready instead of DOMContentLoaded
      if (name === 'DOMContentLoaded') {
        name = 'ready';
      }

      // DOM is already ready
      if (self.domLoaded && name === 'ready' && target.readyState === 'complete') {
        callback.call(scope, fix({ type: name }));
        continue;
      }

      // Fake bubbling of focusin/focusout
      if (!self.hasFocusIn && (name === 'focusin' || name === 'focusout')) {
        capture = true;
        fakeName = name === 'focusin' ? 'focus' : 'blur';
        nativeHandler = (evt) => {
          const event = fix(evt || win.event);
          (event as any).type = event.type === 'focus' ? 'focusin' : 'focusout';
          self.executeHandlers(event, id);
        };
      }

      // Setup callback list and bind native event
      callbackList = self.events[id][name];
      if (!callbackList) {
        self.events[id][name] = callbackList = [{ func: callback, scope }] as CallbackList<any>;
        callbackList.fakeName = fakeName;
        callbackList.capture = capture;
        // callbackList.callback = callback;

        // Add the nativeHandler to the callback list so that we can later unbind it
        callbackList.nativeHandler = nativeHandler;

        // Check if the target has native events support

        if (name === 'ready') {
          bindOnReady(target, nativeHandler, self);
        } else {
          addEvent(target, fakeName || name, nativeHandler, capture);
        }
      } else {
        if (name === 'ready' && self.domLoaded) {
          callback(fix({ type: name }));
        } else {
          // If it already has an native handler then just push the callback
          callbackList.push({ func: callback, scope });
        }
      }
    }

    target = callbackList = null; // Clean memory for IE

    return callback;
  }

  /**
   * Unbinds the specified event by name, name and callback or all events on the target.
   *
   * @method unbind
   * @param {Object} target Target node/window or custom object.
   * @param {String} name Optional event name to unbind.
   * @param {Function} callback Optional callback function to unbind.
   * @return {EventUtils} Event utils instance.
   */
  public unbind <K extends keyof HTMLElementEventMap>(target: any, name: K, callback?: EventUtilsCallback<HTMLElementEventMap[K]>): this;
  public unbind <T = any>(target: any, names: string, callback?: EventUtilsCallback<T>): this;
  public unbind(target: any): this;
  public unbind(target: any, names?: string, callback?: EventUtilsCallback<any>): this {
    // Don't bind to text nodes or comments
    if (!target || NodeType.isText(target) || NodeType.isComment(target)) {
      return this;
    }

    // Unbind event or events if the target has the expando
    const id: number | undefined = target[this.expando];
    if (id) {
      let eventMap = this.events[id];

      // Specific callback
      if (names) {
        const namesList = names.split(' ');
        let i = namesList.length;
        while (i--) {
          const name = namesList[i];
          const callbackList = eventMap[name];

          // Unbind the event if it exists in the map
          if (callbackList) {
            // Remove specified callback
            if (callback) {
              let ci = callbackList.length;
              while (ci--) {
                if (callbackList[ci].func === callback) {
                  const nativeHandler = callbackList.nativeHandler;
                  const fakeName = callbackList.fakeName, capture = callbackList.capture;

                  // Clone callbackList since unbind inside a callback would otherwise break the handlers loop
                  const newCallbackList = callbackList.slice(0, ci).concat(callbackList.slice(ci + 1)) as CallbackList<any>;
                  newCallbackList.nativeHandler = nativeHandler;
                  newCallbackList.fakeName = fakeName;
                  newCallbackList.capture = capture;

                  eventMap[name] = newCallbackList;
                }
              }
            }

            // Remove all callbacks if there isn't a specified callback or there is no callbacks left
            if (!callback || callbackList.length === 0) {
              delete eventMap[name];
              removeEvent(target, callbackList.fakeName || name, callbackList.nativeHandler, callbackList.capture);
            }
          }
        }
      } else {
        // All events for a specific element
        Obj.each(eventMap, (callbackList, name) => {
          removeEvent(target, callbackList.fakeName || name, callbackList.nativeHandler, callbackList.capture);
        });

        eventMap = {};
      }

      // Check if object is empty, if it isn't then we won't remove the expando map
      for (const name in eventMap) {
        if (Obj.has(eventMap, name)) {
          return this;
        }
      }

      // Delete event object
      delete this.events[id];

      // Remove expando from target
      try {
        // IE will fail here since it can't delete properties from window
        delete target[this.expando];
      } catch (ex) {
        // IE will set it to null
        target[this.expando] = null;
      }
    }

    return this;
  }

  /**
   * Fires the specified event on the specified target.
   * <br>
   * <em>Deprecated in TinyMCE 6.0 and has been marked for removal in TinyMCE 7.0. Use <code>dispatch</code> instead.</em>
   *
   * @method fire
   * @param {Object} target Target node/window or custom object.
   * @param {String} name Event name to fire.
   * @param {Object} args Optional arguments to send to the observers.
   * @return {EventUtils} Event utils instance.
   * @deprecated Use dispatch() instead
   */
  public fire(target: any, name: string, args?: {}): this {
    return this.dispatch(target, name, args);
  }

  /**
   * Dispatches the specified event on the specified target.
   *
   * @method dispatch
   * @param {Node/window} target Target node/window or custom object.
   * @param {String} name Event name to dispatch.
   * @param {Object} args Optional arguments to send to the observers.
   * @return {EventUtils} Event utils instance.
   */
  public dispatch(target: any, name: string, args?: {}): this {
    // Don't bind to text nodes or comments
    if (!target || NodeType.isText(target) || NodeType.isComment(target)) {
      return this;
    }

    // Build event object by patching the args
    const event = fix({ type: name, target }, args);

    do {
      // Found an expando that means there is listeners to execute
      const id: number | undefined = target[this.expando];
      if (id) {
        this.executeHandlers(event, id);
      }

      // Walk up the DOM
      target = target.parentNode || target.ownerDocument || target.defaultView || target.parentWindow;
    } while (target && !event.isPropagationStopped());

    return this;
  }

  /**
   * Removes all bound event listeners for the specified target. This will also remove any bound
   * listeners to child nodes within that target.
   *
   * @method clean
   * @param {Object} target Target node/window object.
   * @return {EventUtils} Event utils instance.
   */
  public clean(target: any): this {
    // Don't bind to text nodes or comments
    if (!target || NodeType.isText(target) || NodeType.isComment(target)) {
      return this;
    }

    // Unbind any element on the specified target
    if (target[this.expando]) {
      this.unbind(target);
    }

    // Target doesn't have getElementsByTagName it's probably a window object then use it's document to find the children
    if (!target.getElementsByTagName) {
      target = target.document;
    }

    // Remove events from each child element
    if (target && target.getElementsByTagName) {
      this.unbind(target);

      const children = target.getElementsByTagName('*');
      let i = children.length;
      while (i--) {
        target = children[i];

        if (target[this.expando]) {
          this.unbind(target);
        }
      }
    }

    return this;
  }

  /**
   * Destroys the event object. Call this to remove memory leaks.
   */
  public destroy(): void {
    this.events = {};
  }

  // Legacy function for canceling events
  public cancel <T>(e: EventUtilsEvent<T>): boolean {
    if (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }

    return false;
  }

  /**
   * Executes all event handler callbacks for a specific event.
   *
   * @private
   * @param {Event} evt Event object.
   * @param {String} id Expando id value to look for.
   */
  private executeHandlers<T>(evt: EventUtilsEvent<T>, id: number) {
    const container = this.events[id];

    const callbackList = container && container[evt.type];
    if (callbackList) {
      for (let i = 0, l = callbackList.length; i < l; i++) {
        const callback = callbackList[i];

        // Check if callback exists might be removed if a unbind is called inside the callback
        if (callback && callback.func.call(callback.scope, evt) === false) {
          evt.preventDefault();
        }

        // Should we stop propagation to immediate listeners
        if (evt.isImmediatePropagationStopped()) {
          return;
        }
      }
    }
  }
}

export default EventUtils;
