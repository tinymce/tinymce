/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Focus, WindowSelection } from '@ephox/sugar';
import Delay from 'tinymce/core/api/util/Delay';

const setSelectionAtTouch = function (editorApi, touchEvent) {
  // shortTextFix, when text is short body height is short too, tapping at the bottom of the editor
  // should set a selection. We don't set body height to 100% because of side effects, so we resort
  // to a mousedown on the iDoc, it is a clean place, and very specific to this issue. On a vanilla
  // CE, with body height 100%, event sequence: touchstart, touchend, mousemove, mousedown, FOCUS,
  // mouseup, click. This is why we fire focus on mousedown, to match the natural sequence.
  Focus.focus(editorApi.body());

  // then set the selection to the end, last cursor position
  // Note: the reason why there is a flicker when we touch the bottom, is because of the native scroll
  // cursor into view, in this case it wants to scroll down so the text is centered on the screen,
  // we have to live with this until we control selection
  const touch = touchEvent.raw().changedTouches[0];
  WindowSelection.getAtPoint(editorApi.win(), touch.pageX, touch.pageY).each(function (raw) {
    editorApi.setSelection(raw.start(), raw.soffset(), raw.finish(), raw.foffset());
  });
};

// NOTE: NOT USED YET
const onOrientationReady = function (outerWindow, refreshView) {
  // When rotating into portrait, the page (and toolbar) is off the top of the screen (pageYOffset > 0)
  // when the view settles, the toolbar will readjust to be visible/fixed to the top (pageYOffset = 0)
  // wait for the toolbar to recover before refreshing the view and scrolling cursor into view
  // done here instead of nomad toolbar fixup since that is tied to window scroll, which does not
  // fire on landscape
  const scrollNotZero = Delay.setInterval(function () {
    if (outerWindow.pageYOffset === 0) {
      Delay.clearInterval(scrollNotZero);
      refreshView();
    }
  }, 100);
};

export {
  setSelectionAtTouch,
  onOrientationReady
};
