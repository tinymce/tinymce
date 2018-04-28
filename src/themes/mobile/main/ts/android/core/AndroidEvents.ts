import { Toggling } from '@ephox/alloy';
import { Arr, Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Compare, DomEvent, Element, Focus, Node, Traverse } from '@ephox/sugar';

import TappingEvent from '../../util/TappingEvent';

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
const initEvents = function (editorApi, toolstrip, alloy) {

  const tapping = TappingEvent.monitor(editorApi);
  const outerDoc = Traverse.owner(toolstrip);

  const isRanged = function (sel) {
    return !Compare.eq(sel.start(), sel.finish()) || sel.soffset() !== sel.foffset();
  };

  const hasRangeInUi = function () {
    return Focus.active(outerDoc).filter(function (input) {
      return Node.name(input) === 'input';
    }).exists(function (input) {
      return input.dom().selectionStart !== input.dom().selectionEnd;
    });
  };

  const updateMargin = function () {
    const rangeInContent = editorApi.doc().dom().hasFocus() && editorApi.getSelection().exists(isRanged);
    alloy.getByDom(toolstrip).each((rangeInContent || hasRangeInUi()) === true ? Toggling.on : Toggling.off);
  };

  const listeners = [
    DomEvent.bind(editorApi.body(), 'touchstart', function (evt) {
      editorApi.onTouchContent();
      tapping.fireTouchstart(evt);
    }),
    tapping.onTouchmove(),
    tapping.onTouchend(),

    DomEvent.bind(toolstrip, 'touchstart', function (evt) {
      editorApi.onTouchToolstrip();
    }),

    editorApi.onToReading(function () {
      Focus.blur(editorApi.body());
    }),
    editorApi.onToEditing(Fun.noop),

    // Scroll to cursor and update the iframe height
    editorApi.onScrollToCursor(function (tinyEvent) {
      tinyEvent.preventDefault();
      editorApi.getCursorBox().each(function (bounds) {
        const cWin = editorApi.win();
        // The goal here is to shift as little as required.
        const isOutside = bounds.top() > cWin.innerHeight || bounds.bottom() > cWin.innerHeight;
        const cScrollBy = isOutside ? bounds.bottom() - cWin.innerHeight + 50 /*EXTRA_SPACING*/ : 0;
        if (cScrollBy !== 0) {
          cWin.scrollTo(cWin.pageXOffset, cWin.pageYOffset + cScrollBy);
        }
      });
    })
  ].concat(
    isAndroid6 === true ? [ ] : [
      DomEvent.bind(Element.fromDom(editorApi.win()), 'blur', function () {
        alloy.getByDom(toolstrip).each(Toggling.off);
      }),
      DomEvent.bind(outerDoc, 'select', updateMargin),
      DomEvent.bind(editorApi.doc(), 'selectionchange', updateMargin)
    ]
  );

  const destroy = function () {
    Arr.each(listeners, function (l) {
      l.unbind();
    });
  };

  return {
    destroy
  };
};

export default {
  initEvents
};