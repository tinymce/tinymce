import * as EventUtils from '../../events/EventUtils';
import EventDispatcher, { EditorEvent, MappedEvent } from './EventDispatcher';

interface Observable<T extends {}> {
  fire <K extends string, U extends MappedEvent<T, K>>(name: K, args?: U, bubble?: boolean): EditorEvent<U>;
  dispatch <K extends string, U extends MappedEvent<T, K>>(name: K, args?: U, bubble?: boolean): EditorEvent<U>;
  on <K extends string>(name: K, callback: (event: EditorEvent<MappedEvent<T, K>>) => void, prepend?: boolean): EventDispatcher<T>;
  off <K extends string>(name?: K, callback?: (event: EditorEvent<MappedEvent<T, K>>) => void): EventDispatcher<T>;
  once <K extends string>(name: K, callback: (event: EditorEvent<MappedEvent<T, K>>) => void): EventDispatcher<T>;
  hasEventListeners (name: string): boolean;
}

interface ParentObservable<T extends {}> extends Observable<T> {
  parent?: () => ParentObservable<T>;
}

interface ObservableObject {
  _eventDispatcher?: EventDispatcher<any>;
  toggleNativeEvent?: (name: string, state: boolean) => void;
  removed?: boolean;
  parent?: () => ParentObservable<any> | undefined;
}

/**
 * This mixin adds event binding logic to classes. Adapts the EventDispatcher class.
 *
 * @mixin tinymce.util.Observable
 */

const getEventDispatcher = (obj: ObservableObject): EventDispatcher<any> => {
  if (!obj._eventDispatcher) {
    obj._eventDispatcher = new EventDispatcher({
      scope: obj,
      toggleEvent: (name: string, state: boolean) => {
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
   * <a href="https://www.tiny.cloud/docs/tinymce/6/events/">event reference</a> for more details on each event.
   * <br>
   * <em>Deprecated in TinyMCE 6.0 and has been marked for removal in TinyMCE 7.0. Use <code>dispatch</code> instead.</em>
   *
   * @method fire
   * @param {String} name Name of the event to fire.
   * @param {Object?} args Event arguments.
   * @param {Boolean?} bubble True/false if the event is to be bubbled.
   * @return {Object} Event args instance passed in.
   * @deprecated Use dispatch() instead
   * @example
   * instance.fire('event', {...});
   */
  fire<K extends string, U extends MappedEvent<any, K>>(name: K, args?: U, bubble?: boolean) {
    return this.dispatch(name, args, bubble);
  },

  /**
   * Dispatches the specified event by name. Consult the
   * <a href="https://www.tiny.cloud/docs/tinymce/6/events/">event reference</a> for more details on each event.
   *
   * @method dispatch
   * @param {String} name Name of the event to dispatch.
   * @param {Object?} args Event arguments.
   * @param {Boolean?} bubble True/false if the event is to be bubbled.
   * @return {Object} Event args instance passed in.
   * @example
   * instance.dispatch('event', {...});
   */
  dispatch<K extends string, U extends MappedEvent<any, K>>(this: ObservableObject, name: K, args?: U, bubble?: boolean) {
    const self = this;

    // Prevent all events except the remove/detach event after the instance has been removed
    if (self.removed && name !== 'remove' && name !== 'detach') {
      return EventUtils.normalize<U>(name.toLowerCase(), args ?? {} as U, self);
    }

    const dispatcherArgs = getEventDispatcher(self).dispatch(name, args);

    // Bubble event up to parents
    if (bubble !== false && self.parent) {
      let parent = self.parent();
      while (parent && !dispatcherArgs.isPropagationStopped()) {
        parent.dispatch(name, dispatcherArgs, false);
        parent = parent.parent ? parent.parent() : undefined;
      }
    }

    return dispatcherArgs;
  },

  /**
   * Binds an event listener to a specific event by name. Consult the
   * <a href="https://www.tiny.cloud/docs/tinymce/6/events/">event reference</a> for more details on each event.
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
  on(this: ObservableObject, name, callback, prepend?) {
    return getEventDispatcher(this).on(name, callback, prepend);
  },

  /**
   * Unbinds an event listener to a specific event by name. Consult the
   * <a href="https://www.tiny.cloud/docs/tinymce/6/events/">event reference</a> for more details on each event.
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
  off(this: ObservableObject, name?, callback?) {
    return getEventDispatcher(this).off(name, callback);
  },

  /**
   * Bind the event callback and once it fires the callback is removed. Consult the
   * <a href="https://www.tiny.cloud/docs/tinymce/6/events/">event reference</a> for more details on each event.
   *
   * @method once
   * @param {String} name Name of the event to bind.
   * @param {Function} callback Callback to bind only once.
   * @return {Object} Current class instance.
   */
  once(this: ObservableObject, name, callback) {
    return getEventDispatcher(this).once(name, callback);
  },

  /**
   * Returns true/false if the object has a event of the specified name.
   *
   * @method hasEventListeners
   * @param {String} name Name of the event to check for.
   * @return {Boolean} true/false if the event exists or not.
   */
  hasEventListeners(this: ObservableObject, name) {
    return getEventDispatcher(this).has(name);
  }
};

export default Observable;
