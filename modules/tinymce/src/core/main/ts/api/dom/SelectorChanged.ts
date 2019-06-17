/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node, Element } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import Editor from '../Editor';
import DOMUtils from './DOMUtils';
import Tools from '../util/Tools';

const deleteFromCallbackMap = (callbackMap, selector, callback) => {
  if (callbackMap && callbackMap.hasOwnProperty(selector)) {
    const newCallbacks = Arr.filter(callbackMap[selector], (cb) => cb !== callback);

    if (newCallbacks.length === 0) {
      delete callbackMap[selector];
    } else {
      callbackMap[selector] = newCallbacks;
    }
  }
};

export default (dom: DOMUtils, editor: Editor) => {
  let selectorChangedData, currentSelectors;

  return {
    selectorChangedWithUnbind(selector: string, callback: (active: boolean, args: { node: Node, selector: String, parents: Element[] }) => void): { unbind: () => void } {
      if (!selectorChangedData) {
        selectorChangedData = {};
        currentSelectors = {};

        editor.on('NodeChange', function (e) {
          const node = e.element, parents = dom.getParents(node, null, dom.getRoot()), matchedSelectors = {};

          // Check for new matching selectors
          Tools.each(selectorChangedData, function (callbacks, selector) {
            Tools.each(parents, function (node) {
              if (dom.is(node, selector)) {
                if (!currentSelectors[selector]) {
                  // Execute callbacks
                  Tools.each(callbacks, function (callback) {
                    callback(true, { node, selector, parents });
                  });

                  currentSelectors[selector] = callbacks;
                }

                matchedSelectors[selector] = callbacks;
                return false;
              }
            });
          });

          // Check if current selectors still match
          Tools.each(currentSelectors, function (callbacks, selector) {
            if (!matchedSelectors[selector]) {
              delete currentSelectors[selector];

              Tools.each(callbacks, function (callback) {
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

      return {
        unbind() {
          deleteFromCallbackMap(selectorChangedData, selector, callback);
          deleteFromCallbackMap(currentSelectors, selector, callback);
        }
      };
    }
  };
};