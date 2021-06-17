/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Toggling } from '@ephox/alloy';
import { Arr, Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Compare, DomEvent, Focus, SimRange, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import { PlatformEditor } from '../../ios/core/PlatformEditor';
import * as TappingEvent from '../../util/TappingEvent';

const isAndroid6 = PlatformDetection.detect().os.version.major >= 6;
/*

  `selectionchange` on the iframe document. If the selection is *ranged*, then we add the margin, because we
  assume that the context menu has appeared. If it is collapsed, then the context menu shouldn't appear
  (there is no selected text to format), so we reset the margin to `0px`. Note, when adding a margin,
  we add `23px` --- this is most likely based on trial and error. We may need to work out how to get
  this value properly.

  2. `select` on the outer document. This will also need to add the margin if the selection is ranged within
  an input or textarea

*/
const initEvents = (editorApi: PlatformEditor, toolstrip, alloy) => {

  const tapping = TappingEvent.monitor(editorApi);
  const outerDoc = Traverse.owner(toolstrip);

  const isRanged = (sel: SimRange) => {
    return !Compare.eq(sel.start, sel.finish) || sel.soffset !== sel.foffset;
  };

  const hasRangeInUi = () => {
    return Focus.active(outerDoc).filter((input) => {
      return SugarNode.name(input) === 'input';
    }).exists((input: SugarElement<HTMLInputElement>) => {
      return input.dom.selectionStart !== input.dom.selectionEnd;
    });
  };

  const updateMargin = () => {
    const rangeInContent = editorApi.doc.dom.hasFocus() && editorApi.getSelection().exists(isRanged);
    alloy.getByDom(toolstrip).each((rangeInContent || hasRangeInUi()) === true ? Toggling.on : Toggling.off);
  };

  const listeners = [
    DomEvent.bind(editorApi.body, 'touchstart', (evt) => {
      editorApi.onTouchContent();
      tapping.fireTouchstart(evt);
    }),
    tapping.onTouchmove(),
    tapping.onTouchend(),

    DomEvent.bind(toolstrip, 'touchstart', (_evt) => {
      editorApi.onTouchToolstrip();
    }),

    editorApi.onToReading(() => {
      Focus.blur(editorApi.body);
    }),
    editorApi.onToEditing(Fun.noop),

    // Scroll to cursor and update the iframe height
    editorApi.onScrollToCursor((tinyEvent) => {
      tinyEvent.preventDefault();
      editorApi.getCursorBox().each((bounds) => {
        const cWin = editorApi.win;
        // The goal here is to shift as little as required.
        const isOutside = bounds.top > cWin.innerHeight || bounds.bottom > cWin.innerHeight;
        const cScrollBy = isOutside ? bounds.bottom - cWin.innerHeight + 50 /* EXTRA_SPACING*/ : 0;
        if (cScrollBy !== 0) {
          cWin.scrollTo(cWin.pageXOffset, cWin.pageYOffset + cScrollBy);
        }
      });
    })
  ].concat(
    isAndroid6 === true ? [ ] : [
      DomEvent.bind(SugarElement.fromDom(editorApi.win), 'blur', () => {
        alloy.getByDom(toolstrip).each(Toggling.off);
      }),
      DomEvent.bind(outerDoc, 'select', updateMargin),
      DomEvent.bind(editorApi.doc, 'selectionchange', updateMargin)
    ]
  );

  const destroy = () => {
    Arr.each(listeners, (l) => {
      l.unbind();
    });
  };

  return {
    destroy
  };
};

export {
  initEvents
};
