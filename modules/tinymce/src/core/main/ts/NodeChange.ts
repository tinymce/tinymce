import { Arr, Fun } from '@ephox/katamari';

import Editor from './api/Editor';
import * as Options from './api/Options';
import Delay from './api/util/Delay';
import * as RangeCompare from './selection/RangeCompare';
import { RangeLikeObject } from './selection/RangeTypes';
import { hasAnyRanges } from './selection/SelectionUtils';

/**
 * This class handles the nodechange event dispatching both manual and through selection change events.
 *
 * @class tinymce.NodeChange
 * @private
 */

class NodeChange {
  private readonly editor: Editor;
  private lastPath: Node[] = [];

  public constructor(editor: Editor) {
    this.editor = editor;
    let lastRng: RangeLikeObject | undefined;
    const self = this;

    // Gecko doesn't support the "selectionchange" event
    if (!('onselectionchange' in editor.getDoc())) {
      editor.on('NodeChange click mouseup keyup focus', (e) => {
        // Since DOM Ranges mutate on modification
        // of the DOM we need to clone it's contents
        const nativeRng = editor.selection.getRng();
        const fakeRng = {
          startContainer: nativeRng.startContainer,
          startOffset: nativeRng.startOffset,
          endContainer: nativeRng.endContainer,
          endOffset: nativeRng.endOffset
        };

        // Always treat nodechange as a selectionchange since applying
        // formatting to the current range wouldn't update the range but it's parent
        if (e.type === 'nodechange' || !RangeCompare.isEq(fakeRng, lastRng)) {
          editor.dispatch('SelectionChange');
        }

        lastRng = fakeRng;
      });
    }

    // IE has a bug where it fires a selectionchange on right click that has a range at the start of the body
    // When the contextmenu event fires the selection is located at the right location
    editor.on('contextmenu', () => {
      editor.dispatch('SelectionChange');
    });

    // Selection change is delayed ~200ms on IE when you click inside the current range
    editor.on('SelectionChange', () => {
      const startElm = editor.selection.getStart(true);

      // When focusout from after cef element to other input element the startelm can be undefined
      if (!startElm) {
        return;
      }

      if (hasAnyRanges(editor) && !self.isSameElementPath(startElm) && editor.dom.isChildOf(startElm, editor.getBody())) {
        editor.nodeChanged({ selectionChange: true });
      }
    });

    // Fire an extra nodeChange on mouseup for compatibility reasons
    editor.on('mouseup', (e) => {
      if (!e.isDefaultPrevented() && hasAnyRanges(editor)) {
        // Delay nodeChanged call for WebKit edge case issue where the range
        // isn't updated until after you click outside a selected image
        if (editor.selection.getNode().nodeName === 'IMG') {
          Delay.setEditorTimeout(editor, () => {
            editor.nodeChanged();
          });
        } else {
          editor.nodeChanged();
        }
      }
    });
  }

  /**
   * Dispatches out a onNodeChange event to all observers. This method should be called when you
   * need to update the UI states or element path etc.
   *
   * @method nodeChanged
   * @param {Object} args Optional args to pass to NodeChange event handlers.
   */
  public nodeChanged(args: Record<string, any> = {}): void {
    const selection = this.editor.selection;
    let node: Element | undefined;

    // Fix for bug #1896577 it seems that this can not be fired while the editor is loading
    if (this.editor.initialized && selection && !Options.shouldDisableNodeChange(this.editor) && !this.editor.mode.isReadOnly()) {
      // Get start node
      const root = this.editor.getBody();
      node = selection.getStart(true) || root;

      // Make sure the node is within the editor root or is the editor root
      if (node.ownerDocument !== this.editor.getDoc() || !this.editor.dom.isChildOf(node, root)) {
        node = root;
      }

      // Get parents and add them to object
      const parents: Node[] = [];
      this.editor.dom.getParent(node, (node) => {
        if (node === root) {
          return true;
        } else {
          parents.push(node);
          return false;
        }
      });

      this.editor.dispatch('NodeChange', {
        ...args,
        element: node,
        parents
      });
    }
  }

  /**
   * Returns true/false if the current element path has been changed or not.
   *
   * @private
   * @return {Boolean} True if the element path is the same false if it's not.
   */
  private isSameElementPath(startElm: Element) {
    let i: number;
    const editor = this.editor;

    const currentPath = Arr.reverse(editor.dom.getParents(startElm, Fun.always, editor.getBody()));
    if (currentPath.length === this.lastPath.length) {
      for (i = currentPath.length; i >= 0; i--) {
        if (currentPath[i] !== this.lastPath[i]) {
          break;
        }
      }

      if (i === -1) {
        this.lastPath = currentPath;
        return true;
      }
    }

    this.lastPath = currentPath;

    return false;
  }
}

export {
  NodeChange
};
