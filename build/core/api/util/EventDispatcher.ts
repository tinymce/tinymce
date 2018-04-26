/**
 * EventDispatcher.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from './Tools';

/**
 * This class lets you add/remove and fire events by name on the specified scope. This makes
 * it easy to add event listener logic to any class.
 *
 * @class tinymce.util.EventDispatcher
 * @example
 *  var eventDispatcher = new EventDispatcher();
 *
 *  eventDispatcher.on('click', function() {console.log('data');});
 *  eventDispatcher.fire('click', {data: 123});
 */

const nativeEvents = Tools.makeMap(
  'focus blur focusin focusout click dblclick mousedown mouseup mousemove mouseover beforepaste paste cut copy selectionchange ' +
  'mouseout mouseenter mouseleave wheel keydown keypress keyup input contextmenu dragstart dragend dragover ' +
  'draggesture dragdrop drop drag submit ' +
  'compositionstart compositionend compositionupdate touchstart touchmove touchend',
  ' '
);

const Dispatcher: any = function (settings) {
  const self = this;
  let scope, bindings = {}, toggleEvent;

  const returnFalse = function () {
    return false;
  };

  const returnTrue = function () {
    return true;
  };

  settings = settings || {};
  scope = settings.scope || self;
  toggleEvent = settings.toggleEvent || returnFalse;

  /**
   * Fires the specified event by name.
   *
   * @method fire
   * @param {String} name Name of the event to fire.
   * @param {Object?} args Event arguments.
   * @return {Object} Event args instance passed in.
   * @example
   * instance.fire('event', {...});
   */
  const fire = function (name, args) {
    let handlers, i, l, callback;

    name = name.toLowerCase();
    args = args || {};
    args.type = name;

    // Setup target is there isn't one
    if (!args.target) {
      args.target = scope;
    }

    // Add event delegation methods if they are missing
    if (!args.preventDefault) {
      // Add preventDefault method
      args.preventDefault = function () {
        args.isDefaultPrevented = returnTrue;
      };

      // Add stopPropagation
      args.stopPropagation = function () {
        args.isPropagationStopped = returnTrue;
      };

      // Add stopImmediatePropagation
      args.stopImmediatePropagation = function () {
        args.isImmediatePropagationStopped = returnTrue;
      };

      // Add event delegation states
      args.isDefaultPrevented = returnFalse;
      args.isPropagationStopped = returnFalse;
      args.isImmediatePropagationStopped = returnFalse;
    }

    if (settings.beforeFire) {
      settings.beforeFire(args);
    }

    handlers = bindings[name];
    if (handlers) {
      for (i = 0, l = handlers.length; i < l; i++) {
        callback = handlers[i];

        // Unbind handlers marked with "once"
        if (callback.once) {
          off(name, callback.func);
        }

        // Stop immediate propagation if needed
        if (args.isImmediatePropagationStopped()) {
          args.stopPropagation();
          return args;
        }

        // If callback returns false then prevent default and stop all propagation
        if (callback.func.call(scope, args) === false) {
          args.preventDefault();
          return args;
        }
      }
    }

    return args;
  };

  /**
   * Binds an event listener to a specific event by name.
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
  const on = function (name, callback, prepend, extra) {
    let handlers, names, i;

    if (callback === false) {
      callback = returnFalse;
    }

    if (callback) {
      callback = {
        func: callback
      };

      if (extra) {
        Tools.extend(callback, extra);
      }

      names = name.toLowerCase().split(' ');
      i = names.length;
      while (i--) {
        name = names[i];
        handlers = bindings[name];
        if (!handlers) {
          handlers = bindings[name] = [];
          toggleEvent(name, true);
        }

        if (prepend) {
          handlers.unshift(callback);
        } else {
          handlers.push(callback);
        }
      }
    }

    return self;
  };

  /**
   * Unbinds an event listener to a specific event by name.
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
  const off = function (name, callback) {
    let i, handlers, bindingName, names, hi;

    if (name) {
      names = name.toLowerCase().split(' ');
      i = names.length;
      while (i--) {
        name = names[i];
        handlers = bindings[name];

        // Unbind all handlers
        if (!name) {
          for (bindingName in bindings) {
            toggleEvent(bindingName, false);
            delete bindings[bindingName];
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
              if (handlers[hi].func === callback) {
                handlers = handlers.slice(0, hi).concat(handlers.slice(hi + 1));
                bindings[name] = handlers;
              }
            }
          }

          if (!handlers.length) {
            toggleEvent(name, false);
            delete bindings[name];
          }
        }
      }
    } else {
      for (name in bindings) {
        toggleEvent(name, false);
      }

      bindings = {};
    }

    return self;
  };

  /**
   * Binds an event listener to a specific event by name
   * and automatically unbind the event once the callback fires.
   *
   * @method once
   * @param {String} name Event name or space separated list of events to bind.
   * @param {callback} callback Callback to be executed when the event occurs.
   * @param {Boolean} first Optional flag if the event should be prepended. Use this with care.
   * @return {Object} Current class instance.
   * @example
   * instance.once('event', function(e) {
   *     // Callback logic
   * });
   */
  const once = function (name, callback, prepend) {
    return on(name, callback, prepend, { once: true });
  };

  /**
   * Returns true/false if the dispatcher has a event of the specified name.
   *
   * @method has
   * @param {String} name Name of the event to check for.
   * @return {Boolean} true/false if the event exists or not.
   */
  const has = function (name) {
    name = name.toLowerCase();
    return !(!bindings[name] || bindings[name].length === 0);
  };

  // Expose
  self.fire = fire;
  self.on = on;
  self.off = off;
  self.once = once;
  self.has = has;
};

/**
 * Returns true/false if the specified event name is a native browser event or not.
 *
 * @method isNative
 * @param {String} name Name to check if it's native.
 * @return {Boolean} true/false if the event is native or not.
 * @static
 */
Dispatcher.isNative = function (name) {
  return !!nativeEvents[name.toLowerCase()];
};

export default Dispatcher;