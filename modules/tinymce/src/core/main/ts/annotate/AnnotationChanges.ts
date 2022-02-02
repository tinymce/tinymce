/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Cell, Obj, Optional, Optionals, Singleton, Throttler } from '@ephox/katamari';

import Editor from '../api/Editor';
import { AnnotationsRegistry } from './AnnotationsRegistry';
import { identify } from './Identification';

export interface AnnotationChanges {
  readonly addListener: (name: string, f: AnnotationListener) => void;
}

export type AnnotationListener = (state: boolean, name: string, data?: { uid: string; nodes: any[] }) => void;

export interface AnnotationListenerData {
  readonly listeners: AnnotationListener[];
  readonly previous: Singleton.Value<string>;
}

export type AnnotationListenerMap = Record<string, AnnotationListenerData>;

const setup = (editor: Editor, _registry: AnnotationsRegistry): AnnotationChanges => {
  const changeCallbacks = Cell<AnnotationListenerMap>({ });

  const initData = (): AnnotationListenerData => ({
    listeners: [ ],
    previous: Singleton.value()
  });

  const withCallbacks = (name: string, f: (listeners: AnnotationListenerData) => void) => {
    updateCallbacks(name, (data) => {
      f(data);
      return data;
    });
  };

  const updateCallbacks = (name: string, f: (inputData: AnnotationListenerData) => AnnotationListenerData) => {
    const callbackMap = changeCallbacks.get();
    const data = Obj.get(callbackMap, name).getOrThunk(initData);
    const outputData = f(data);
    callbackMap[name] = outputData;
    changeCallbacks.set(callbackMap);
  };

  const fireCallbacks = (name: string, uid: string, elements: any[]): void => {
    withCallbacks(name, (data) => {
      Arr.each(data.listeners, (f) => f(true, name, {
        uid,
        nodes: Arr.map(elements, (elem) => elem.dom)
      }));
    });
  };

  const fireNoAnnotation = (name: string): void => {
    withCallbacks(name, (data) => {
      Arr.each(data.listeners, (f) => f(false, name));
    });
  };

  // NOTE: Runs in alphabetical order.
  const onNodeChange = Throttler.last(() => {
    const callbackMap = changeCallbacks.get();
    const annotations = Arr.sort(Obj.keys(callbackMap));
    Arr.each(annotations, (name) => {
      updateCallbacks(name, (data) => {
        const prev = data.previous.get();
        identify(editor, Optional.some(name)).fold(
          () => {
            if (prev.isSome()) {
              // Changed from something to nothing.
              fireNoAnnotation(name);
              data.previous.clear();
            }
          },
          ({ uid, name, elements }) => {
            // Changed from a different annotation (or nothing)
            if (!Optionals.is(prev, uid)) {
              fireCallbacks(name, uid, elements);
              data.previous.set(uid);
            }
          }
        );

        return {
          previous: data.previous,
          listeners: data.listeners
        };
      });
    });
  }, 30);

  editor.on('remove', () => {
    onNodeChange.cancel();
  });

  editor.on('NodeChange', () => {
    onNodeChange.throttle();
  });

  const addListener = (name: string, f: AnnotationListener): void => {
    updateCallbacks(name, (data) => ({
      previous: data.previous,
      listeners: data.listeners.concat([ f ])
    }));
  };

  return {
    addListener
  };
};

export {
  setup
};
