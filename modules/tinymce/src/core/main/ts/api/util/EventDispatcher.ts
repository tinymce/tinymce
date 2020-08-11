/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Obj } from '@ephox/katamari';
import Tools from './Tools';

export type MappedEvent<T, K extends string> = K extends keyof T ? T[K] : any;

export interface NativeEventMap {
  'beforepaste': Event;
  'blur': FocusEvent;
  'beforeinput': InputEvent;
  'click': MouseEvent;
  'compositionend': Event;
  'compositionstart': Event;
  'compositionupdate': Event;
  'contextmenu': PointerEvent;
  'copy': ClipboardEvent;
  'cut': ClipboardEvent;
  'dblclick': MouseEvent;
  'drag': DragEvent;
  'dragdrop': DragEvent;
  'dragend': DragEvent;
  'draggesture': DragEvent;
  'dragover': DragEvent;
  'dragstart': DragEvent;
  'drop': DragEvent;
  'focus': FocusEvent;
  'focusin': FocusEvent;
  'focusout': FocusEvent;
  'input': InputEvent;
  'keydown': KeyboardEvent;
  'keypress': KeyboardEvent;
  'keyup': KeyboardEvent;
  'mousedown': MouseEvent;
  'mouseenter': MouseEvent;
  'mouseleave': MouseEvent;
  'mousemove': MouseEvent;
  'mouseout': MouseEvent;
  'mouseover': MouseEvent;
  'mouseup': MouseEvent;
  'paste': ClipboardEvent;
  'selectionchange': Event;
  'submit': Event;
  'touchend': TouchEvent;
  'touchmove': TouchEvent;
  'touchstart': TouchEvent;
  'touchcancel': TouchEvent;
  'wheel': WheelEvent;
}

export type EditorEvent<T> = T & {
  target: any;
  type: string;
  preventDefault (): void;
  isDefaultPrevented (): boolean;
  stopPropagation (): void;
  isPropagationStopped (): boolean;
  stopImmediatePropagation (): void;
  isImmediatePropagationStopped (): boolean;
};

export interface EventDispatcherSettings {
  scope?: any;
  toggleEvent?: (name: string, state: boolean) => void | boolean;
  beforeFire?: <T>(args: EditorEvent<T>) => void;
}

export interface EventDispatcherConstructor<T extends NativeEventMap> {
  readonly prototype: EventDispatcher<T>;

  new (settings?: EventDispatcherSettings): EventDispatcher<T>;

  isNative (name: string): boolean;
}

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
  'mouseout mouseenter mouseleave wheel keydown keypress keyup input beforeinput contextmenu dragstart dragend dragover ' +
  'draggesture dragdrop drop drag submit ' +
  'compositionstart compositionend compositionupdate touchstart touchmove touchend touchcancel',
  ' '
);

interface Binding<T, K extends string> {
  func: (event: EditorEvent<MappedEvent<T, K>>) => void;
  once?: true;
}

type Bindings<T> = {
  [K in string]?: Binding<T, K>[];
};

class EventDispatcher<T> {
  /**
   * Returns true/false if the specified event name is a native browser event or not.
   *
   * @method isNative
   * @param {String} name Name to check if it's native.
   * @return {Boolean} true/false if the event is native or not.
   * @static
   */
  public static isNative(name: string): boolean {
    return !!nativeEvents[name.toLowerCase()];
  }

  private readonly settings: Record<string, any>;
  private readonly scope: {};
  private readonly toggleEvent: (name: string, toggle: boolean) => void;
  private bindings: Bindings<T> = {};

  public constructor(settings?: Record<string, any>) {
    this.settings = settings || {};
    this.scope = this.settings.scope || this;
    this.toggleEvent = this.settings.toggleEvent || Fun.never;
  }

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
  public fire <K extends string, U extends MappedEvent<T, K>>(nameIn: K, argsIn?: U): EditorEvent<U> {
    const name = nameIn.toLowerCase();
    const args = argsIn || {} as any;
    args.type = name;

    // Setup target is there isn't one
    if (!args.target) {
      args.target = this.scope;
    }

    // Add event delegation methods if they are missing
    if (!args.preventDefault) {
      // Add preventDefault method
      args.preventDefault = function () {
        args.isDefaultPrevented = Fun.always;
      };

      // Add stopPropagation
      args.stopPropagation = function () {
        args.isPropagationStopped = Fun.always;
      };

      // Add stopImmediatePropagation
      args.stopImmediatePropagation = function () {
        args.isImmediatePropagationStopped = Fun.always;
      };

      // Add event delegation states
      args.isDefaultPrevented = Fun.never;
      args.isPropagationStopped = Fun.never;
      args.isImmediatePropagationStopped = Fun.never;
    }

    if (this.settings.beforeFire) {
      this.settings.beforeFire(args);
    }

    const handlers = this.bindings[name];
    if (handlers) {
      for (let i = 0, l = handlers.length; i < l; i++) {
        const callback = handlers[i];

        // Unbind handlers marked with "once"
        if (callback.once) {
          this.off(name, callback.func);
        }

        // Stop immediate propagation if needed
        if (args.isImmediatePropagationStopped()) {
          args.stopPropagation();
          return args;
        }

        // If callback returns false then prevent default and stop all propagation
        if (callback.func.call(this.scope, args) === false) {
          args.preventDefault();
          return args;
        }
      }
    }

    return args;
  }

  /**
   * Binds an event listener to a specific event by name.
   *
   * @method on
   * @param {String} name Event name or space separated list of events to bind.
   * @param {callback} callback Callback to be executed when the event occurs.
   * @param {Boolean} prepend Optional flag if the event should be prepended. Use this with care.
   * @return {Object} Current class instance.
   * @example
   * instance.on('event', function(e) {
   *     // Callback logic
   * });
   */
  public on <K extends string>(name: K, callback: false | ((event: EditorEvent<MappedEvent<T, K>>) => void), prepend?: boolean, extra?: {}): this {
    if (callback === false) {
      callback = Fun.never;
    }

    if (callback) {
      const wrappedCallback = {
        func: callback
      };

      if (extra) {
        Tools.extend(wrappedCallback, extra);
      }

      const names = name.toLowerCase().split(' ');
      let i = names.length;
      while (i--) {
        const currentName = names[i];
        let handlers = this.bindings[currentName];
        if (!handlers) {
          handlers = this.bindings[currentName] = [];
          this.toggleEvent(currentName, true);
        }

        if (prepend) {
          handlers.unshift(wrappedCallback);
        } else {
          handlers.push(wrappedCallback);
        }
      }
    }

    return this;
  }

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
  public off <K extends string>(name?: K, callback?: (event: EditorEvent<MappedEvent<T, K>>) => void): this {
    if (name) {
      const names = name.toLowerCase().split(' ');
      let i = names.length;
      while (i--) {
        const currentName = names[i];
        let handlers = this.bindings[currentName];

        // Unbind all handlers
        if (!currentName) {
          Obj.each(this.bindings, (_value, bindingName) => {
            this.toggleEvent(bindingName, false);
            delete this.bindings[bindingName];
          });

          return this;
        }

        if (handlers) {
          // Unbind all by name
          if (!callback) {
            handlers.length = 0;
          } else {
            // Unbind specific ones
            let hi = handlers.length;
            while (hi--) {
              if (handlers[hi].func === callback) {
                handlers = handlers.slice(0, hi).concat(handlers.slice(hi + 1));
                this.bindings[currentName] = handlers;
              }
            }
          }

          if (!handlers.length) {
            this.toggleEvent(name, false);
            delete this.bindings[currentName];
          }
        }
      }
    } else {
      Obj.each(this.bindings, (_value, name) => {
        this.toggleEvent(name, false);
      });

      this.bindings = {};
    }

    return this;
  }

  /**
   * Binds an event listener to a specific event by name
   * and automatically unbind the event once the callback fires.
   *
   * @method once
   * @param {String} name Event name or space separated list of events to bind.
   * @param {callback} callback Callback to be executed when the event occurs.
   * @param {Boolean} prepend Optional flag if the event should be prepended. Use this with care.
   * @return {Object} Current class instance.
   * @example
   * instance.once('event', function(e) {
   *     // Callback logic
   * });
   */
  public once <K extends string>(name: K, callback: (event: EditorEvent<MappedEvent<T, K>>) => void, prepend?: boolean): this {
    return this.on(name, callback, prepend, { once: true });
  }

  /**
   * Returns true/false if the dispatcher has a event of the specified name.
   *
   * @method has
   * @param {String} name Name of the event to check for.
   * @return {Boolean} true/false if the event exists or not.
   */
  public has(name: string): boolean {
    name = name.toLowerCase();
    return !(!this.bindings[name] || this.bindings[name].length === 0);
  }
}

export default EventDispatcher;
