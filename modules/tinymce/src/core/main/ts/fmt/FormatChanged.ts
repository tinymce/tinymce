/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element, Node } from '@ephox/dom-globals';
import { Arr, Cell, Obj } from '@ephox/katamari';
import Editor from '../api/Editor';
import Tools from '../api/util/Tools';
import * as FormatUtils from './FormatUtils';
import * as MatchFormat from './MatchFormat';

export type FormatChangeCallback = (state: boolean, data: { node: Node, format: string, parents: any }) => void;
type FormatCallbacks = Record<string, FormatChangeCallback[]>;
type FormatData = { similar?: boolean, callbacks: FormatChangeCallback[] };
type RegisteredFormats = Record<string, FormatData>;

const setup = (registeredFormatListeners: Cell<RegisteredFormats>, editor: Editor) => {
  const currentFormats = Cell<Record<string, FormatChangeCallback[]>>({ });

  registeredFormatListeners.set({});

  editor.on('NodeChange', (e) => {
    updateAndFireChangeCallbacks(editor, e.element, currentFormats, registeredFormatListeners.get());
  });
};

const updateAndFireChangeCallbacks = (editor: Editor, elm: Element, currentFormats: Cell<FormatCallbacks>, formatChangeData: RegisteredFormats) => {
  const formatsList = Obj.keys(currentFormats.get());
  const newFormats: FormatCallbacks = { };
  const matchedFormats: FormatCallbacks = { };

  // Ignore bogus nodes like the <a> tag created by moveStart()
  const parents = Arr.filter(FormatUtils.getParents(editor.dom, elm), (node) => {
    return node.nodeType === 1 && !node.getAttribute('data-mce-bogus');
  });

  // Check for new formats
  Obj.each(formatChangeData, (data: FormatData, format: string) => {
    Tools.each(parents, (node: Node) => {
      if (editor.formatter.matchNode(node, format, {}, data.similar)) {
        if (formatsList.indexOf(format) === -1) {
          // Execute callbacks
          Arr.each(data.callbacks, (callback: FormatChangeCallback) => {
            callback(true, { node, format, parents });
          });

          newFormats[format] = data.callbacks;
        }

        matchedFormats[format] = data.callbacks;
        return false;
      }

      if (MatchFormat.matchesUnInheritedFormatSelector(editor, node, format)) {
        return false;
      }
    });
  });

  // Check if current formats still match
  const remainingFormats = filterRemainingFormats(currentFormats.get(), matchedFormats, elm, parents);

  // Update the current formats
  currentFormats.set({
    ...newFormats,
    ...remainingFormats
  });
};

const filterRemainingFormats = (currentFormats: FormatCallbacks, matchedFormats: FormatCallbacks, elm: Element, parents: Node[]) => {
  return Obj.bifilter(currentFormats, (callbacks: FormatChangeCallback[], format: string) => {
    if (!Obj.has(matchedFormats, format)) {
      // Execute callbacks
      Arr.each(callbacks, (callback: FormatChangeCallback) => {
        callback(false, { node: elm, format, parents });
      });

      return false;
    } else {
      return true;
    }
  }).t;
};

const addListeners = (registeredFormatListeners: Cell<RegisteredFormats>, formats: string, callback: FormatChangeCallback, similar: boolean) => {
  const formatChangeItems = registeredFormatListeners.get();

  Arr.each(formats.split(','), (format) => {
    if (!formatChangeItems[format]) {
      formatChangeItems[format] = { similar, callbacks: [] };
    }

    formatChangeItems[format].callbacks.push(callback);
  });

  registeredFormatListeners.set(formatChangeItems);
};

const removeListeners = (registeredFormatListeners: Cell<RegisteredFormats>, formats: string, callback: FormatChangeCallback) => {
  const formatChangeItems = registeredFormatListeners.get();

  Arr.each(formats.split(','), (format) => {
    formatChangeItems[format].callbacks = Arr.filter(formatChangeItems[format].callbacks, (c) => {
      return c !== callback;
    });

    if (formatChangeItems[format].callbacks.length === 0) {
      delete formatChangeItems[format];
    }
  });

  registeredFormatListeners.set(formatChangeItems);
};

const formatChanged = (editor: Editor, registeredFormatListeners: Cell<RegisteredFormats>, formats: string, callback: FormatChangeCallback, similar?: boolean) => {
  if (registeredFormatListeners.get() === null) {
    setup(registeredFormatListeners, editor);
  }

  addListeners(registeredFormatListeners, formats, callback, similar);

  return {
    unbind: () => removeListeners(registeredFormatListeners, formats, callback)
  };
};

export {
  formatChanged
};
