define(
  'tinymce.themes.mobile.android.core.AndroidEvents',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.properties.Css',
    'tinymce.themes.mobile.util.TappingEvent'
  ],

  function (Arr, Fun, PlatformDetection, Compare, DomEvent, Css, TappingEvent) {
    var ANDROID_CONTEXT_TOOLBAR_HEIGHT = '23px';

    var isAndroid6 = PlatformDetection.detect().os.version.major >= 6;
    /*

      `selectionchange` on the iframe document. If the selection is *ranged*, then we add the margin, because we
      assume that the context menu has appeared. If it is collapsed, then the context menu shouldn't appear
      (there is no selected text to format), so we reset the margin to `0px`. Note, when adding a margin,
      we add `23px` --- this is most likely based on trial and error. We may need to work out how to get
      this value properly.

      2. `focusin` on the outer document. This will always reset the margin back to `0px`. The idea is
      that if the outer window has focus, then Android doesn't think there is any selected text to provide
      a context menu for.

    */
    var initEvents = function (editorApi, toolstrip) {

      var tapping = TappingEvent.monitor(editorApi);

      var listeners = [
        DomEvent.bind(editorApi.body(), 'touchstart', function (evt) {
          editorApi.onTouchContent();
          tapping.fireTouchstart(evt);
        }),
        tapping.onTouchmove(),
        tapping.onTouchend(),

        editorApi.onToReading(Fun.noop),

        // Scroll to cursor and update the iframe height
        editorApi.onScrollToCursor(function (tinyEvent) {
          tinyEvent.preventDefault();
          console.log("scrolling to cursor')")
          editorApi.getCursorBox().each(function (bounds) {
            var cWin = editorApi.win();
            // The goal here is to shift as little as required.
            var isOutside = bounds.top() > cWin.innerHeight || bounds.bottom() > cWin.innerHeight;
            var cScrollBy = isOutside ? bounds.bottom() - cWin.innerHeight + 50/*EXTRA_SPACING*/ : 0;
            if (cScrollBy !== 0) {
              cWin.scrollTo(cWin.pageXOffset, cWin.pageYOffset + cScrollBy);
            }            
          });
        })
      ].concat(
        isAndroid6 ? [ ] : [
          DomEvent.bind(editorApi.doc(), 'selectionchange', function () {
            var hasRange = editorApi.getSelection().exists(function (sel) {
              return !Compare.eq(sel.start(), sel.finish()) || sel.soffset() !== sel.foffset();
            });
            if (hasRange) {
              Css.set(toolstrip, 'margin-top', ANDROID_CONTEXT_TOOLBAR_HEIGHT);
            } else {
              Css.remove(toolstrip, 'margin-top');
            }
          })
        ]
      );

      var destroy = function () {
        Arr.each(listeners, function (l) {
          l.unbind();
        });
      };

      return {
        destroy: destroy
      };
    };

    return {
      initEvents: initEvents
    };
  }
);
