/* eslint-disable */
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
import { Arr } from '@ephox/katamari';
import ModelManager, { ModelElement } from 'tinymce/core/api/ModelManager';

let elementsAsModelElements = elements => Arr.map(elements, htmlElementToModelElement)

const htmlElementToModelElement = (element: HTMLElement) => {
  const modelElement = {
    name: element.tagName.toLowerCase()
    // todo: need to create a type property based on the tag name and I guess the editor schema?
  };

  Object.defineProperties(modelElement, {
    attributes: {
      get: () => {
        return Object.freeze(element.attributes);
      }
    },
    children: {
      get: () => {
        return Arr.map(element.children, htmlElementToModelElement);
      }
    }
  });

  return modelElement as ModelElement;
}

export default () => {
  ModelManager.add('dom', (editor) => {
    const root = editor.getBody();
    return {
      getNodes: (at = 'selection') => {
        // TODO: switch behaviour based on `at`. Probably requires `isPath`, `isPoint` etc.
        return elementsAsModelElements(root.children);
      },
      setNodes: (options, attributes, at = 'selection') => {
        return;
      },
      removeNodes: (options, at = 'selection') => {
        return;
      }
    }
  });
};
