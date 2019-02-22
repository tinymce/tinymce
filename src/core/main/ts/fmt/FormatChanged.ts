/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Cell, Obj } from '@ephox/katamari';
import { Node } from '@ephox/dom-globals';
import { Editor } from 'tinymce/core/api/Editor';
import FormatUtils from './FormatUtils';
import MatchFormat from './MatchFormat';

export type FormatChangeCallback = (state: boolean, data: { node: Node, format: string, parents: any }) => void;
type FormatChangeCallbackList = (FormatChangeCallback[] & { similar?: boolean });
type FormatChangedData = Record<string, FormatChangeCallbackList>;

const setup = (formatChangeData: Cell<FormatChangedData>, editor: Editor) => {
  const currentFormats = {};

  formatChangeData.set({});

  editor.on('NodeChange', (e) => {
    let parents = FormatUtils.getParents(editor.dom, e.element);
    const matchedFormats = {};

    // Ignore bogus nodes like the <a> tag created by moveStart()
    parents = Arr.filter(parents, (node) => {
      return node.nodeType === 1 && !node.getAttribute('data-mce-bogus');
    });

    // Check for new formats
    Obj.each(formatChangeData.get(), (callbacks: FormatChangeCallbackList, format: string) => {
      Arr.exists(parents, (node: Node) => {
        if (editor.formatter.matchNode(node, format, {}, callbacks.similar)) {
          if (!currentFormats[format]) {
            // Execute callbacks
            Arr.each(callbacks, (callback: FormatChangeCallback) => {
              callback(true, { node, format, parents });
            });

            currentFormats[format] = callbacks;
          }

          matchedFormats[format] = callbacks;
          return true;
        }

        return MatchFormat.matchesUnInheritedFormatSelector(editor, node, format);
      });
    });

    // Check if current formats still match
    Obj.each(currentFormats, (callbacks: FormatChangeCallbackList, format: string) => {
      if (!matchedFormats[format]) {
        delete currentFormats[format];

        Arr.each(callbacks, (callback: FormatChangeCallback) => {
          callback(false, { node: e.element, format, parents });
        });
      }
    });
  });
};

const addListeners = (formatChangeData: Cell<FormatChangedData>, formats: string, callback: FormatChangeCallback, similar: boolean) => {
  const formatChangeItems = formatChangeData.get();

  Arr.each(formats.split(','), (format) => {
    if (!formatChangeItems[format]) {
      formatChangeItems[format] = [];
      formatChangeItems[format].similar = similar;
    }

    formatChangeItems[format].push(callback);
  });

  formatChangeData.set(formatChangeItems);
};

const removeListeners = (formatChangeData: Cell<FormatChangedData>, formats: string, callback: FormatChangeCallback) => {
  const formatChangeItems = formatChangeData.get();

  Arr.each(formats.split(','), (format) => {
    formatChangeItems[format] = Arr.filter(formatChangeItems[format], (c) => {
      return c !== callback;
    });

    if (formatChangeItems[format].length === 0) {
      delete formatChangeItems[format];
    }
  });

  formatChangeData.set(formatChangeItems);
};

const formatChanged = (editor: Editor, formatChangeState: Cell<FormatChangedData>, formats: string, callback: FormatChangeCallback, similar?: boolean) => {
  formatChangedWithUnbind(editor, formatChangeState, formats, callback, similar);
};

const formatChangedWithUnbind = (editor: Editor, formatChangeState: Cell<FormatChangedData>, formats: string, callback: FormatChangeCallback, similar?: boolean) => {
  if (formatChangeState.get() === null) {
    setup(formatChangeState, editor);
  }

  addListeners(formatChangeState, formats, callback, similar);

  return {
    unbind: () => removeListeners(formatChangeState, formats, callback)
  };
};

export default {
  formatChanged,
  formatChangedWithUnbind
};