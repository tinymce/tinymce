/**
 * UiContainer.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.themes.inlite.alien.UiContainer',
  [
    'ephox.katamari.api.Option',
    'tinymce.core.Env',
    'tinymce.core.dom.DOMUtils'
  ],
  function (Option, Env, DOMUtils) {
    var getUiContainerDelta = function () {
      var uiContainer = Env.container;
      if (uiContainer && DOMUtils.DOM.getStyle(uiContainer, 'position', true) !== 'static') {
        var containerPos = DOMUtils.DOM.getPos(uiContainer);
        var dx = containerPos.x - uiContainer.scrollLeft;
        var dy = containerPos.y - uiContainer.scrollTop;
        return Option.some({
          x: dx,
          y: dy
        });
      } else {
        return Option.none();
      }
    };

    return {
      getUiContainerDelta: getUiContainerDelta
    };
  }
);
