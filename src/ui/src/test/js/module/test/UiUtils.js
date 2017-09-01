define(
  'tinymce.ui.test.UiUtils',
  [
    'ephox.agar.api.Assertions',
    'tinymce.core.dom.DOMUtils'
  ],
  function (Assertions, DOMUtils) {
    var rect = function (viewBlock, ctrl) {
      var outerRect, innerRect;

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

    var size = function (ctrl) {
      var rect;

      if (ctrl.nodeType) {
        rect = ctrl.getBoundingClientRect();
      } else {
        rect = ctrl.getEl().getBoundingClientRect();
      }

      return [rect.width, rect.height];
    };

    var nearlyEqualRects = function (rect1, rect2, diff) {
      diff = diff || 1;

      for (var i = 0; i < 4; i++) {
        if (Math.abs(rect1[i] - rect2[i]) > diff) {
          Assertions.assertEq('Should be equal rects', rect2, rect1);
          return;
        }
      }
    };

    var loadSkinAndOverride = function (viewBlock, done) {
      viewBlock.attach();
      DOMUtils.DOM.addClass(viewBlock.get(), 'ui-overrides');
      DOMUtils.DOM.styleSheetLoader.loadAll([
        '/project/src/skins/lightgray/dist/lightgray/skin.min.css',
        '/project/src/core/src/test/css/ui-overrides.css'
      ], function () {
        done();
      });
    };

    return {
      rect: rect,
      size: size,
      nearlyEqualRects: nearlyEqualRects,
      loadSkinAndOverride: loadSkinAndOverride
    };
  }
);