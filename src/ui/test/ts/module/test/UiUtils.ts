import { Assertions } from '@ephox/agar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';

const rect = function (viewBlock, ctrl) {
  let outerRect, innerRect;

  if (ctrl.nodeType) {
    innerRect = ctrl.getBoundingClientRect();
  } else {
    innerRect = ctrl.getEl().getBoundingClientRect();
  }

  outerRect = viewBlock.get().getBoundingClientRect();

  return [
    Math.round(innerRect.left - outerRect.left),
    Math.round(innerRect.top - outerRect.top),
    Math.round(innerRect.right - innerRect.left),
    Math.round(innerRect.bottom - innerRect.top)
  ];
};

const size = function (ctrl) {
  let rect;

  if (ctrl.nodeType) {
    rect = ctrl.getBoundingClientRect();
  } else {
    rect = ctrl.getEl().getBoundingClientRect();
  }

  return [rect.width, rect.height];
};

const nearlyEqualRects = function (rect1, rect2, diff?) {
  diff = diff || 1;

  for (let i = 0; i < 4; i++) {
    if (Math.abs(rect1[i] - rect2[i]) > diff) {
      Assertions.assertEq('Should be equal rects', rect2, rect1);
      return;
    }
  }
};

const loadSkinAndOverride = function (viewBlock, done) {
  viewBlock.attach();
  DOMUtils.DOM.addClass(viewBlock.get(), 'ui-overrides');
  DOMUtils.DOM.styleSheetLoader.loadAll([
    '/project/js/tinymce/skins/lightgray/skin.min.css',
    '/project/src/core/test/css/ui-overrides.css'
  ], function () {
    done();
  }, () => {
    throw new Error('error');
  });
};

export default {
  rect,
  size,
  nearlyEqualRects,
  loadSkinAndOverride
};