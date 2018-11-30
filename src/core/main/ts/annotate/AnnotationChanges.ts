/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AnnotationsRegistry } from 'tinymce/core/annotate/AnnotationsRegistry';
import { Editor } from 'tinymce/core/api/Editor';
import { Throttler, Option, Arr, Cell, Obj } from '@ephox/katamari';
import { identify } from './Identification';

export interface AnnotationChanges {
  addListener: (name: string, f: AnnotationListener) => void;
}

export type AnnotationListener = (state: boolean, name: string, data?: { uid: string, nodes: any[] }) => void;

export interface AnnotationListenerData {
  listeners: AnnotationListener[];
  previous: Cell<Option<string>>;
}

export type AnnotationListenerMap = Record<string, AnnotationListenerData>;

const setup = (editor: Editor, registry: AnnotationsRegistry): AnnotationChanges => {
  const changeCallbacks = Cell<AnnotationListenerMap>({ });

  const initData = (): AnnotationListenerData => ({
    listeners: [ ],
    previous: Cell(Option.none())
  });

  const withCallbacks = (name: string, f: (listeners: AnnotationListenerData) => void) => {
    updateCallbacks(name, (data) => {
      f(data);
      return data;
    });
  };

  const updateCallbacks = (name: string, f: (inputData: AnnotationListenerData) => AnnotationListenerData) => {
    const callbackMap = changeCallbacks.get();
    const data = callbackMap.hasOwnProperty(name) ? callbackMap[name] : initData();
    const outputData = f(data);
    callbackMap[name] = outputData;
    changeCallbacks.set(callbackMap);
  };

  const fireCallbacks = (name: string, uid: string, elements: any[]): void => {
    withCallbacks(name, (data) => {
      Arr.each(data.listeners, (f) => f(true, name, {
        uid,
        nodes: Arr.map(elements, (elem) => elem.dom())
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
        identify(editor, Option.some(name)).fold(
          () => {
            if (prev.isSome()) {
              // Changed from something to nothing.
              fireNoAnnotation(name);
              data.previous.set(Option.none());
            }
          },
          ({ uid, name, elements }) => {
            // Changed from a different annotation (or nothing)
            if (! prev.is(uid)) {
              fireCallbacks(name, uid, elements);
              data.previous.set(Option.some(uid));
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

  editor.on('nodeChange', () => {
    onNodeChange.throttle();
  });

  const addListener = (name: string, f: AnnotationListener): void => {
    updateCallbacks(name, (data) => {
      return {
        previous: data.previous,
        listeners: data.listeners.concat([ f ])
      };
    });
  };

  return {
    addListener
  };
};

export {
  setup
};
