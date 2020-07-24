/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import EventDispatcher, { EditorEvent } from './EventDispatcher';

interface Observable<T> {
  fire <K extends keyof T>(name: K, args?: T[K], bubble?: boolean): EditorEvent<T[K]>;
  fire <U = any>(name: string, args?: U, bubble?: boolean): EditorEvent<U>;
  on <K extends keyof T>(name: K, callback: (event: EditorEvent<T[K]>) => void, prepend?: boolean): EventDispatcher<T>;
  on <U = any>(name: string, callback: (event: EditorEvent<U>) => void, prepend?: boolean): EventDispatcher<T>;
  off <K extends keyof T>(name?: K, callback?: (event: EditorEvent<T[K]>) => void): EventDispatcher<T>;
  off <U = any>(name?: string, callback?: (event: EditorEvent<U>) => void): EventDispatcher<T>;
  once <K extends keyof T>(name: K, callback: (event: EditorEvent<T[K]>) => void): EventDispatcher<T>;
  once <U = any>(name: string, callback: (event: EditorEvent<U>) => void): EventDispatcher<T>;
  hasEventListeners (name: string): boolean;
}

/**
 * This mixin will add event binding logic to classes.
 *
 * @mixin tinymce.util.Observable
 */

const getEventDispatcher = function (obj): EventDispatcher<any> {
  if (!obj._eventDispatcher) {
    obj._eventDispatcher = new EventDispatcher({
      scope: obj,
      toggleEvent(name, state) {
        if (EventDispatcher.isNative(name) && obj.toggleNativeEvent) {
          obj.toggleNativeEvent(name, state);
        }
      }
    });
  }

  return obj._eventDispatcher;
};

const Observable: Observable<any> = {
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
  fire(name, args?, bubble?) {
    const self = this;

    // Prevent all events except the remove/detach event after the instance has been removed
    if (self.removed && name !== 'remove' && name !== 'detach') {
      // TODO should we be patching the EventArgs here like EventDispatcher?
      return args;
    }

    const dispatcherArgs = getEventDispatcher(self).fire(name, args);

    // Bubble event up to parents
    if (bubble !== false && self.parent) {
      let parent = self.parent();
      while (parent && !dispatcherArgs.isPropagationStopped()) {
        parent.fire(name, dispatcherArgs, false);
        parent = parent.parent();
      }
    }

    return dispatcherArgs;
  },

  /**
   * Binds an event listener to a specific event by name. Consult the
   * <a href="/docs/advanced/events">event reference</a> for more details on each event.
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
  on(name, callback, prepend?) {
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
  off(name?, callback?) {
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
  once(name, callback) {
    return getEventDispatcher(this).once(name, callback);
  },

  /**
   * Returns true/false if the object has a event of the specified name.
   *
   * @method hasEventListeners
   * @param {String} name Name of the event to check for.
   * @return {Boolean} true/false if the event exists or not.
   */
  hasEventListeners(name) {
    return getEventDispatcher(this).has(name);
  }
};

export default Observable;
