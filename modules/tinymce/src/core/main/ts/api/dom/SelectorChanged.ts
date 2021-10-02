/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj, Optional } from '@ephox/katamari';

import Editor from '../Editor';
import Tools from '../util/Tools';
import DOMUtils from './DOMUtils';

const deleteFromCallbackMap = (callbackMap, selector, callback) => {
  if (callbackMap && Obj.has(callbackMap, selector)) {
    const newCallbacks = Arr.filter(callbackMap[selector], (cb) => cb !== callback);

    if (newCallbacks.length === 0) {
      delete callbackMap[selector];
    } else {
      callbackMap[selector] = newCallbacks;
    }
  }
};

type SelectorChangedCallback = (active: boolean, args: { node: Node; selector: String; parents: Element[] }) => void;

export default (dom: DOMUtils, editor: Editor) => {
  let selectorChangedData: Record<string, SelectorChangedCallback[]>;
  let currentSelectors: Record<string, SelectorChangedCallback[]>;

  const findMatchingNode = (selector: string, nodes: Node[]): Optional<Node> =>
    Arr.find(nodes, (node) => dom.is(node, selector));

  const getParents = (elem: Element): Element[] =>
    dom.getParents(elem, null, dom.getRoot());

  return {
    selectorChangedWithUnbind: (selector: string, callback: SelectorChangedCallback): { unbind: () => void } => {
      if (!selectorChangedData) {
        selectorChangedData = {};
        currentSelectors = {};

        editor.on('NodeChange', (e) => {
          const node = e.element;
          const parents = getParents(node);
          const matchedSelectors = {};

          // Check for new matching selectors
          Tools.each(selectorChangedData, (callbacks, selector) => {
            findMatchingNode(selector, parents).each((node) => {
              if (!currentSelectors[selector]) {
                // Execute callbacks
                Arr.each(callbacks, (callback) => {
                  callback(true, { node, selector, parents });
                });

                currentSelectors[selector] = callbacks;
              }

              matchedSelectors[selector] = callbacks;
            });
          });

          // Check if current selectors still match
          Tools.each(currentSelectors, (callbacks, selector) => {
            if (!matchedSelectors[selector]) {
              delete currentSelectors[selector];

              Tools.each(callbacks, (callback) => {
                callback(false, { node, selector, parents });
              });
            }
          });
        });
      }

      // Add selector listeners
      if (!selectorChangedData[selector]) {
        selectorChangedData[selector] = [];
      }

      selectorChangedData[selector].push(callback);

      // Setup the initial state if selected already
      findMatchingNode(selector, getParents(editor.selection.getStart())).each(() => {
        currentSelectors[selector] = selectorChangedData[selector];
      });

      return {
        unbind: () => {
          deleteFromCallbackMap(selectorChangedData, selector, callback);
          deleteFromCallbackMap(currentSelectors, selector, callback);
        }
      };
    }
  };
};
