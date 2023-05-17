import { Arr, Fun, Obj } from '@ephox/katamari';

import * as EventUtils from '../../events/EventUtils';
import Tools from './Tools';

export type MappedEvent<T extends {}, K extends string> = K extends keyof T ? T[K] : any;

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

export type EditorEvent<T> = EventUtils.NormalizedEvent<T>;

export interface EventDispatcherSettings {
  scope?: any;
  toggleEvent?: (name: string, state: boolean) => void | boolean;
  beforeFire?: <T>(args: EditorEvent<T>) => void;
}

export interface EventDispatcherConstructor<T extends {}> {
  readonly prototype: EventDispatcher<T>;

  new (settings?: EventDispatcherSettings): EventDispatcher<T>;

  isNative: (name: string) => boolean;
}

/**
 * This class lets you add/remove and dispatch events by name on the specified scope. This makes
 * it easy to add event listener logic to any class.
 *
 * @class tinymce.util.EventDispatcher
 * @example
 * const eventDispatcher = new EventDispatcher();
 *
 * eventDispatcher.on('click', () => console.log('data'));
 * eventDispatcher.dispatch('click', { data: 123 });
 */

const nativeEvents = Tools.makeMap(
  'focus blur focusin focusout click dblclick mousedown mouseup mousemove mouseover beforepaste paste cut copy selectionchange ' +
  'mouseout mouseenter mouseleave wheel keydown keypress keyup input beforeinput contextmenu dragstart dragend dragover ' +
  'draggesture dragdrop drop drag submit ' +
  'compositionstart compositionend compositionupdate touchstart touchmove touchend touchcancel',
  ' '
);

interface Binding<T extends {}, K extends string> {
  func: (event: EditorEvent<MappedEvent<T, K>>) => void | boolean;
  removed: boolean;
  once?: true;
}

type Bindings<T extends {}> = {
  [K in string]?: Binding<T, K>[];
};

class EventDispatcher<T extends {}> {
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

  private readonly settings: EventDispatcherSettings;
  private readonly scope: any;
  private readonly toggleEvent: (name: string, toggle: boolean) => void;
  private bindings: Bindings<T> = {};

  public constructor(settings?: EventDispatcherSettings) {
    this.settings = settings || {};
    this.scope = this.settings.scope || this;
    this.toggleEvent = this.settings.toggleEvent || Fun.never;
  }

  /**
   * Fires the specified event by name.
   * <br>
   * <em>Deprecated in TinyMCE 6.0 and has been marked for removal in TinyMCE 7.0. Use <code>dispatch</code> instead.</em>
   *
   * @method fire
   * @param {String} name Name of the event to fire.
   * @param {Object?} args Event arguments.
   * @return {Object} Event args instance passed in.
   * @deprecated Use dispatch() instead
   * @example
   * instance.fire('event', {...});
   */
  public fire <K extends string, U extends MappedEvent<T, K>>(name: K, args?: U): EditorEvent<U> {
    return this.dispatch(name, args);
  }

  /**
   * Dispatches the specified event by name.
   *
   * @method dispatch
   * @param {String} name Name of the event to dispatch
   * @param {Object?} args Event arguments.
   * @return {Object} Event args instance passed in.
   * @example
   * instance.dispatch('event', {...});
   */
  public dispatch <K extends string, U extends MappedEvent<T, K>>(name: K, args?: U): EditorEvent<U> {
    const lcName = name.toLowerCase();
    const event = EventUtils.normalize(lcName, args ?? {}, this.scope) as EventUtils.NormalizedEvent<U>;

    if (this.settings.beforeFire) {
      this.settings.beforeFire(event);
    }

    // Don't clone the array here as this is a hot code path, so instead the handlers
    // array is recreated and the this.bindings[name] reference is updated in the `on`
    // and `off` functions. This is done to avoid the handlers array being mutated while
    // we're iterating over it below.
    const handlers = this.bindings[lcName];
    if (handlers) {
      for (let i = 0, l = handlers.length; i < l; i++) {
        const callback = handlers[i];

        // The handler was removed by an earlier handler in this loop so skip it.
        if (callback.removed) {
          continue;
        }

        // Unbind handlers marked with "once"
        if (callback.once) {
          this.off(lcName, callback.func);
        }

        // Stop immediate propagation if needed
        if (event.isImmediatePropagationStopped()) {
          return event;
        }

        // If callback returns false then prevent default and stop all propagation
        if (callback.func.call(this.scope, event) === false) {
          event.preventDefault();
          return event;
        }
      }
    }

    return event;
  }

  /**
   * Binds an event listener to a specific event by name.
   *
   * @method on
   * @param {String} name Event name or space separated list of events to bind.
   * @param {Function} callback Callback to be executed when the event occurs.
   * @param {Boolean} prepend Optional flag if the event should be prepended. Use this with care.
   * @return {Object} Current class instance.
   * @example
   * instance.on('event', (e) => {
   *   // Callback logic
   * });
   */
  public on <K extends string>(name: K, callback: false | ((event: EditorEvent<MappedEvent<T, K>>) => void | boolean), prepend?: boolean, extra?: {}): this {
    if (callback === false) {
      callback = Fun.never;
    }

    if (callback) {
      const wrappedCallback: Binding<T, string> = {
        func: callback as (event: EditorEvent<MappedEvent<T, string>>) => void | boolean,
        removed: false
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
          handlers = [];
          this.toggleEvent(currentName, true);
        }

        if (prepend) {
          handlers = [ wrappedCallback, ...handlers ];
        } else {
          handlers = [ ...handlers, wrappedCallback ];
        }

        this.bindings[currentName] = handlers;
      }
    }

    return this;
  }

  /**
   * Unbinds an event listener to a specific event by name.
   *
   * @method off
   * @param {String?} name Name of the event to unbind.
   * @param {Function?} callback Callback to unbind.
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
            // Unbind specific handlers
            const filteredHandlers = Arr.partition(handlers, (handler) => handler.func === callback);
            handlers = filteredHandlers.fail;
            this.bindings[currentName] = handlers;
            // Mark the removed handlers in case this event is already being processed in `fire`
            Arr.each(filteredHandlers.pass, (handler) => {
              handler.removed = true;
            });
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
   * @param {Function} callback Callback to be executed when the event occurs.
   * @param {Boolean} prepend Optional flag if the event should be prepended. Use this with care.
   * @return {Object} Current class instance.
   * @example
   * instance.once('event', (e) => {
   *   // Callback logic
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
    const binding = this.bindings[name];
    return !(!binding || binding.length === 0);
  }
}

export default EventDispatcher;
