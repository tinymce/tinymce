/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { document, HTMLElementEventMap, window } from '@ephox/dom-globals';
import Env from '../Env';
import Delay from '../util/Delay';

export type EventUtilsCallback<T> = (event: EventUtilsEvent<T>) => void;

export type EventUtilsEvent<T> = T & {
  type: string;
  target: any;
  isDefaultPrevented (): boolean;
  preventDefault (): void;
  isPropagationStopped (): boolean;
  stopPropagation (): void;
  isImmediatePropagationStopped (): boolean;
  stopImmediatePropagation (): void;
};

/**
 * This class wraps the browsers native event logic with more convenient methods.
 *
 * @class tinymce.dom.EventUtils
 */

const eventExpandoPrefix = 'mce-data-';
const mouseEventRe = /^(?:mouse|contextmenu)|click/;
const deprecated = {
  keyLocation: 1, layerX: 1, layerY: 1, returnValue: 1,
  webkitMovementX: 1, webkitMovementY: 1, keyIdentifier: 1, mozPressure: 1
};

// Checks if it is our own isDefaultPrevented function
const hasIsDefaultPrevented = function (event) {
  return event.isDefaultPrevented === returnTrue || event.isDefaultPrevented === returnFalse;
};

// Dummy function that gets replaced on the delegation state functions
const returnFalse = function () {
  return false;
};

// Dummy function that gets replaced on the delegation state functions
const returnTrue = function () {
  return true;
};

/**
 * Binds a native event to a callback on the speified target.
 */
const addEvent = function (target, name, callback, capture?) {
  if (target.addEventListener) {
    target.addEventListener(name, callback, capture || false);
  } else if (target.attachEvent) {
    target.attachEvent('on' + name, callback);
  }
};

/**
 * Unbinds a native event callback on the specified target.
 */
const removeEvent = function (target, name, callback, capture?) {
  if (target.removeEventListener) {
    target.removeEventListener(name, callback, capture || false);
  } else if (target.detachEvent) {
    target.detachEvent('on' + name, callback);
  }
};

/**
 * Gets the event target based on shadow dom properties like path and composedPath.
 */
const getTargetFromShadowDom = function (event, defaultTarget) {
  // When target element is inside Shadow DOM we need to take first element from composedPath
  // otherwise we'll get Shadow Root parent, not actual target element
  if (event.composedPath) {
    const composedPath = event.composedPath();
    if (composedPath && composedPath.length > 0) {
      return composedPath[0];
    }
  }

  return defaultTarget;
};

/**
 * Normalizes a native event object or just adds the event specific methods on a custom event.
 */
const fix = function <T extends any>(originalEvent: T, data?): EventUtilsEvent<T> {
  let name;
  const event = data || {};

  // Copy all properties from the original event
  for (name in originalEvent) {
    // layerX/layerY is deprecated in Chrome and produces a warning
    if (!deprecated[name]) {
      event[name] = originalEvent[name];
    }
  }

  // Normalize target IE uses srcElement
  if (!event.target) {
    event.target = event.srcElement || document;
  }

  // Experimental shadow dom support
  if (Env.experimentalShadowDom) {
    event.target = getTargetFromShadowDom(originalEvent, event.target);
  }

  // Calculate pageX/Y if missing and clientX/Y available
  if (originalEvent && mouseEventRe.test(originalEvent.type) && originalEvent.pageX === undefined && originalEvent.clientX !== undefined) {
    const eventDoc = event.target.ownerDocument || document;
    const doc = eventDoc.documentElement;
    const body = eventDoc.body;

    event.pageX = originalEvent.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
      (doc && doc.clientLeft || body && body.clientLeft || 0);

    event.pageY = originalEvent.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) -
      (doc && doc.clientTop || body && body.clientTop || 0);
  }

  // Add preventDefault method
  event.preventDefault = function () {
    event.isDefaultPrevented = returnTrue;

    // Execute preventDefault on the original event object
    if (originalEvent) {
      if (originalEvent.preventDefault) {
        originalEvent.preventDefault();
      } else {
        originalEvent.returnValue = false; // IE
      }
    }
  };

  // Add stopPropagation
  event.stopPropagation = function () {
    event.isPropagationStopped = returnTrue;

    // Execute stopPropagation on the original event object
    if (originalEvent) {
      if (originalEvent.stopPropagation) {
        originalEvent.stopPropagation();
      } else {
        originalEvent.cancelBubble = true; // IE
      }
    }
  };

  // Add stopImmediatePropagation
  event.stopImmediatePropagation = function () {
    event.isImmediatePropagationStopped = returnTrue;
    event.stopPropagation();
  };

  // Add event delegation states
  if (hasIsDefaultPrevented(event) === false) {
    event.isDefaultPrevented = returnFalse;
    event.isPropagationStopped = returnFalse;
    event.isImmediatePropagationStopped = returnFalse;
  }

  // Add missing metaKey for IE 8
  if (typeof event.metaKey === 'undefined') {
    event.metaKey = false;
  }

  return event;
};

/**
 * Bind a DOMContentLoaded event across browsers and executes the callback once the page DOM is initialized.
 * It will also set/check the domLoaded state of the event_utils instance so ready isn't called multiple times.
 */
const bindOnReady = function (win, callback, eventUtils) {
  const doc = win.document, event = { type: 'ready' };

  if (eventUtils.domLoaded) {
    callback(event);
    return;
  }

  const isDocReady = function () {
    // Check complete or interactive state if there is a body
    // element on some iframes IE 8 will produce a null body
    return doc.readyState === 'complete' || (doc.readyState === 'interactive' && doc.body);
  };

  // Gets called when the DOM is ready
  const readyHandler = function () {
    removeEvent(win, 'DOMContentLoaded', readyHandler);
    removeEvent(win, 'load', readyHandler);

    if (!eventUtils.domLoaded) {
      eventUtils.domLoaded = true;
      callback(event);
    }
  };

  const waitForDomLoaded = function () {
    if (isDocReady()) {
      removeEvent(doc, 'readystatechange', waitForDomLoaded);
      readyHandler();
    }
  };

  const tryScroll = function () {
    try {
      // If IE is used, use the trick by Diego Perini licensed under MIT by request to the author.
      // http://javascript.nwbox.com/IEContentLoaded/
      doc.documentElement.doScroll('left');
    } catch (ex) {
      Delay.setTimeout(tryScroll);
      return;
    }

    readyHandler();
  };

  // Use W3C method (exclude IE 9,10 - readyState "interactive" became valid only in IE 11)
  if (doc.addEventListener && !(Env.ie && Env.ie < 11)) {
    if (isDocReady()) {
      readyHandler();
    } else {
      addEvent(win, 'DOMContentLoaded', readyHandler);
    }
  } else {
    // Use IE method
    addEvent(doc, 'readystatechange', waitForDomLoaded);

    // Wait until we can scroll, when we can the DOM is initialized
    if (doc.documentElement.doScroll && win.self === win.top) {
      tryScroll();
    }
  }

  // Fallback if any of the above methods should fail for some odd reason
  addEvent(win, 'load', readyHandler);
};

export interface EventUtilsConstructor {
  readonly prototype: EventUtils;

  Event: EventUtils;

  new (): EventUtils;
}

/**
 * This class enables you to bind/unbind native events to elements and normalize it's behavior across browsers.
 */
class EventUtils {
  public static Event: EventUtils = new EventUtils();

  // State if the DOMContentLoaded was executed or not
  public domLoaded: boolean = false;
  public events: Record<string, any> = {};

  private readonly expando;
  private hasFocusIn: boolean;
  private hasMouseEnterLeave: boolean;
  private mouseEnterLeave: { mouseenter: 'mouseover', mouseleave: 'mouseout' };
  private count: number = 1;

  constructor () {
    this.expando = eventExpandoPrefix + (+new Date()).toString(32);
    this.hasMouseEnterLeave = 'onmouseenter' in document.documentElement;
    this.hasFocusIn = 'onfocusin' in document.documentElement;
    this.count = 1;
  }

  /**
   * Binds a callback to an event on the specified target.
   *
   * @method bind
   * @param {Object} target Target node/window or custom object.
   * @param {String} names Name of the event to bind.
   * @param {function} callback Callback function to execute when the event occurs.
   * @param {Object} scope Scope to call the callback function on, defaults to target.
   * @return {function} Callback function that got bound.
   */
  public bind <K extends keyof HTMLElementEventMap>(target: any, name: K, callback: EventUtilsCallback<HTMLElementEventMap[K]>, scope?: {}): EventUtilsCallback<HTMLElementEventMap[K]>;
  public bind <T = any>(target: any, names: string, callback: EventUtilsCallback<T>, scope?: {}): EventUtilsCallback<T>;
  public bind (target: any, names: string, callback: EventUtilsCallback<any>, scope?: {}): EventUtilsCallback<any> {
    const self = this;
    let id, callbackList, i, name, fakeName, nativeHandler, capture;
    const win = window;

    // Native event handler function patches the event and executes the callbacks for the expando
    const defaultNativeHandler = function (evt) {
      self.executeHandlers(fix(evt || win.event), id);
    };

    // Don't bind to text nodes or comments
    if (!target || target.nodeType === 3 || target.nodeType === 8) {
      return;
    }

    // Create or get events id for the target
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
    i = namesList.length;
    while (i--) {
      name = namesList[i];
      nativeHandler = defaultNativeHandler;
      fakeName = capture = false;

      // Use ready instead of DOMContentLoaded
      if (name === 'DOMContentLoaded') {
        name = 'ready';
      }

      // DOM is already ready
      if (self.domLoaded && name === 'ready' && target.readyState === 'complete') {
        callback.call(scope, fix({ type: name }));
        continue;
      }

      // Handle mouseenter/mouseleaver
      if (!self.hasMouseEnterLeave) {
        fakeName = self.mouseEnterLeave[name];

        if (fakeName) {
          nativeHandler = function (evt) {
            let current, related;

            current = evt.currentTarget;
            related = evt.relatedTarget;

            // Check if related is inside the current target if it's not then the event should
            // be ignored since it's a mouseover/mouseout inside the element
            if (related && current.contains) {
              // Use contains for performance
              related = current.contains(related);
            } else {
              while (related && related !== current) {
                related = related.parentNode;
              }
            }

            // Fire fake event
            if (!related) {
              evt = fix(evt || win.event);
              evt.type = evt.type === 'mouseout' ? 'mouseleave' : 'mouseenter';
              evt.target = current;
              self.executeHandlers(evt, id);
            }
          };
        }
      }

      // Fake bubbling of focusin/focusout
      if (!self.hasFocusIn && (name === 'focusin' || name === 'focusout')) {
        capture = true;
        fakeName = name === 'focusin' ? 'focus' : 'blur';
        nativeHandler = function (evt) {
          evt = fix(evt || win.event);
          evt.type = evt.type === 'focus' ? 'focusin' : 'focusout';
          self.executeHandlers(evt, id);
        };
      }

      // Setup callback list and bind native event
      callbackList = self.events[id][name];
      if (!callbackList) {
        self.events[id][name] = callbackList = [{ func: callback, scope }];
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
          callback(fix({ type: name }) as EventUtilsEvent<any>);
        } else {
          // If it already has an native handler then just push the callback
          callbackList.push({ func: callback, scope });
        }
      }
    }

    target = callbackList = 0; // Clean memory for IE

    return callback;
  }

  /**
   * Unbinds the specified event by name, name and callback or all events on the target.
   *
   * @method unbind
   * @param {Object} target Target node/window or custom object.
   * @param {String} names Optional event name to unbind.
   * @param {function} callback Optional callback function to unbind.
   * @return {EventUtils} Event utils instance.
   */
  public unbind <K extends keyof HTMLElementEventMap>(target: any, name: K, callback?: EventUtilsCallback<HTMLElementEventMap[K]>): this;
  public unbind <T = any>(target: any, names: string, callback?: EventUtilsCallback<T>): this;
  public unbind (target: any): this;
  public unbind (target: any, names?: string, callback?: EventUtilsCallback<any>): this {
    let id, callbackList, i, ci, name, eventMap;

    // Don't bind to text nodes or comments
    if (!target || target.nodeType === 3 || target.nodeType === 8) {
      return this;
    }

    // Unbind event or events if the target has the expando
    id = target[this.expando];
    if (id) {
      eventMap = this.events[id];

      // Specific callback
      if (names) {
        const namesList = names.split(' ');
        i = namesList.length;
        while (i--) {
          name = namesList[i];
          callbackList = eventMap[name];

          // Unbind the event if it exists in the map
          if (callbackList) {
            // Remove specified callback
            if (callback) {
              ci = callbackList.length;
              while (ci--) {
                if (callbackList[ci].func === callback) {
                  const nativeHandler = callbackList.nativeHandler;
                  const fakeName = callbackList.fakeName, capture = callbackList.capture;

                  // Clone callbackList since unbind inside a callback would otherwise break the handlers loop
                  callbackList = callbackList.slice(0, ci).concat(callbackList.slice(ci + 1));
                  callbackList.nativeHandler = nativeHandler;
                  callbackList.fakeName = fakeName;
                  callbackList.capture = capture;

                  eventMap[name] = callbackList;
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
        for (name in eventMap) {
          callbackList = eventMap[name];
          removeEvent(target, callbackList.fakeName || name, callbackList.nativeHandler, callbackList.capture);
        }

        eventMap = {};
      }

      // Check if object is empty, if it isn't then we won't remove the expando map
      for (name in eventMap) {
        return this;
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
   *
   * @method fire
   * @param {Object} target Target node/window or custom object.
   * @param {String} name Event name to fire.
   * @param {Object} args Optional arguments to send to the observers.
   * @return {EventUtils} Event utils instance.
   */
  public fire (target: any, name: string, args?: {}): this {
    let id;

    // Don't bind to text nodes or comments
    if (!target || target.nodeType === 3 || target.nodeType === 8) {
      return this;
    }

    // Build event object by patching the args
    const event = fix(null, args);
    event.type = name;
    event.target = target;

    do {
      // Found an expando that means there is listeners to execute
      id = target[this.expando];
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
  public clean (target: any): this {
    let i, children;

    // Don't bind to text nodes or comments
    if (!target || target.nodeType === 3 || target.nodeType === 8) {
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

      children = target.getElementsByTagName('*');
      i = children.length;
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
   * Destroys the event object. Call this on IE to remove memory leaks.
   */
  public destroy () {
    this.events = {};
  }

  // Legacy function for canceling events
  public cancel <T = any>(e: EventUtilsEvent<T>): boolean {
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
  private executeHandlers (evt, id) {
    let callbackList, i, l, callback;
    const container = this.events[id];

    callbackList = container && container[evt.type];
    if (callbackList) {
      for (i = 0, l = callbackList.length; i < l; i++) {
        callback = callbackList[i];

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