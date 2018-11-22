/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Delay from 'tinymce/core/api/util/Delay';
import { document } from '@ephox/dom-globals';

/**
 * This class will automatically reflow controls on the next animation frame within a few milliseconds on older browsers.
 * If the user manually reflows then the automatic reflow will be cancelled. This class is used internally when various control states
 * changes that triggers a reflow.
 *
 * @class tinymce.ui.ReflowQueue
 * @static
 */

let dirtyCtrls = {}, animationFrameRequested;

export default {
  /**
   * Adds a control to the next automatic reflow call. This is the control that had a state
   * change for example if the control was hidden/shown.
   *
   * @method add
   * @param {tinymce.ui.Control} ctrl Control to add to queue.
   */
  add (ctrl) {
    const parent = ctrl.parent();

    if (parent) {
      if (!parent._layout || parent._layout.isNative()) {
        return;
      }

      if (!dirtyCtrls[parent._id]) {
        dirtyCtrls[parent._id] = parent;
      }

      if (!animationFrameRequested) {
        animationFrameRequested = true;

        Delay.requestAnimationFrame(function () {
          let id, ctrl;

          animationFrameRequested = false;

          for (id in dirtyCtrls) {
            ctrl = dirtyCtrls[id];

            if (ctrl.state.get('rendered')) {
              ctrl.reflow();
            }
          }

          dirtyCtrls = {};
        }, document.body);
      }
    }
  },

  /**
   * Removes the specified control from the automatic reflow. This will happen when for example the user
   * manually triggers a reflow.
   *
   * @method remove
   * @param {tinymce.ui.Control} ctrl Control to remove from queue.
   */
  remove (ctrl) {
    if (dirtyCtrls[ctrl._id]) {
      delete dirtyCtrls[ctrl._id];
    }
  }
};