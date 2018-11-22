/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Env from './api/Env';
import RangeCompare from './selection/RangeCompare';
import Delay from './api/util/Delay';
import { hasAnyRanges } from 'tinymce/core/selection/SelectionUtils';

/**
 * This class handles the nodechange event dispatching both manual and through selection change events.
 *
 * @class tinymce.NodeChange
 * @private
 */

export default function (editor) {
  let lastRng, lastPath = [];

  /**
   * Returns true/false if the current element path has been changed or not.
   *
   * @private
   * @return {Boolean} True if the element path is the same false if it's not.
   */
  const isSameElementPath = function (startElm) {
    let i, currentPath;

    currentPath = editor.$(startElm).parentsUntil(editor.getBody()).add(startElm);
    if (currentPath.length === lastPath.length) {
      for (i = currentPath.length; i >= 0; i--) {
        if (currentPath[i] !== lastPath[i]) {
          break;
        }
      }

      if (i === -1) {
        lastPath = currentPath;
        return true;
      }
    }

    lastPath = currentPath;

    return false;
  };

  // Gecko doesn't support the "selectionchange" event
  if (!('onselectionchange' in editor.getDoc())) {
    editor.on('NodeChange Click MouseUp KeyUp Focus', function (e) {
      let nativeRng, fakeRng;

      // Since DOM Ranges mutate on modification
      // of the DOM we need to clone it's contents
      nativeRng = editor.selection.getRng();
      fakeRng = {
        startContainer: nativeRng.startContainer,
        startOffset: nativeRng.startOffset,
        endContainer: nativeRng.endContainer,
        endOffset: nativeRng.endOffset
      };

      // Always treat nodechange as a selectionchange since applying
      // formatting to the current range wouldn't update the range but it's parent
      if (e.type === 'nodechange' || !RangeCompare.isEq(fakeRng, lastRng)) {
        editor.fire('SelectionChange');
      }

      lastRng = fakeRng;
    });
  }

  // IE has a bug where it fires a selectionchange on right click that has a range at the start of the body
  // When the contextmenu event fires the selection is located at the right location
  editor.on('contextmenu', function () {
    editor.fire('SelectionChange');
  });

  // Selection change is delayed ~200ms on IE when you click inside the current range
  editor.on('SelectionChange', function () {
    const startElm = editor.selection.getStart(true);

    // When focusout from after cef element to other input element the startelm can be undefined.
    // IE 8 will fire a selectionchange event with an incorrect selection
    // when focusing out of table cells. Click inside cell -> toolbar = Invalid SelectionChange event
    if (!startElm || (!Env.range && editor.selection.isCollapsed())) {
      return;
    }

    if (hasAnyRanges(editor) && !isSameElementPath(startElm) && editor.dom.isChildOf(startElm, editor.getBody())) {
      editor.nodeChanged({ selectionChange: true });
    }
  });

  // Fire an extra nodeChange on mouseup for compatibility reasons
  editor.on('MouseUp', function (e) {
    if (!e.isDefaultPrevented() && hasAnyRanges(editor)) {
      // Delay nodeChanged call for WebKit edge case issue where the range
      // isn't updated until after you click outside a selected image
      if (editor.selection.getNode().nodeName === 'IMG') {
        Delay.setEditorTimeout(editor, function () {
          editor.nodeChanged();
        });
      } else {
        editor.nodeChanged();
      }
    }
  });

  /**
   * Dispatches out a onNodeChange event to all observers. This method should be called when you
   * need to update the UI states or element path etc.
   *
   * @method nodeChanged
   * @param {Object} args Optional args to pass to NodeChange event handlers.
   */
  this.nodeChanged = function (args) {
    const selection = editor.selection;
    let node, parents, root;

    // Fix for bug #1896577 it seems that this can not be fired while the editor is loading
    if (editor.initialized && selection && !editor.settings.disable_nodechange && !editor.readonly) {
      // Get start node
      root = editor.getBody();
      node = selection.getStart(true) || root;

      // Make sure the node is within the editor root or is the editor root
      if (node.ownerDocument !== editor.getDoc() || !editor.dom.isChildOf(node, root)) {
        node = root;
      }

      // Get parents and add them to object
      parents = [];
      editor.dom.getParent(node, function (node) {
        if (node === root) {
          return true;
        }

        parents.push(node);
      });

      args = args || {};
      args.element = node;
      args.parents = parents;

      editor.fire('NodeChange', args);
    }
  };
}