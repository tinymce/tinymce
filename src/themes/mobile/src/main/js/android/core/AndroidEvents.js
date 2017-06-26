define(
  'tinymce.themes.mobile.android.core.AndroidEvents',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.search.Traverse',
    'ephox.sugar.api.selection.WindowSelection',
    'tinymce.themes.mobile.util.TappingEvent'
  ],

  function (Arr, Fun, PlatformDetection, Compare, Focus, DomEvent, Node, Css, Traverse, WindowSelection, TappingEvent) {
    var ANDROID_CONTEXT_TOOLBAR_HEIGHT = '23px';

    var isAndroid6 = PlatformDetection.detect().os.version.major >= 6;
    /*

      `selectionchange` on the iframe document. If the selection is *ranged*, then we add the margin, because we
      assume that the context menu has appeared. If it is collapsed, then the context menu shouldn't appear
      (there is no selected text to format), so we reset the margin to `0px`. Note, when adding a margin,
      we add `23px` --- this is most likely based on trial and error. We may need to work out how to get
      this value properly.

      2. `select` on the outer document. This will also need to add the margin if the selection is ranged within
      an input or textarea

    */
    var initEvents = function (editorApi, toolstrip) {

      var tapping = TappingEvent.monitor(editorApi);
      var outerDoc = Traverse.owner(toolstrip);

      var isRanged = function (sel) {
        return !Compare.eq(sel.start(), sel.finish()) || sel.soffset() !== sel.foffset();
      };

      var hasRangeInUi = function () {
        return Focus.active(outerDoc).filter(function (input) {
          return Node.name(input) === 'input';
        }).exists(function (input) {
          return input.dom().selectionStart !== input.dom().selectionEnd;
        });
      };

      var updateMargin = function () {
        var rangeInContent = editorApi.doc().dom().hasFocus() && editorApi.getSelection().exists(isRanged);
        if (rangeInContent || hasRangeInUi()) {
          Css.set(toolstrip, 'margin-top', ANDROID_CONTEXT_TOOLBAR_HEIGHT);
        } else {
          Css.remove(toolstrip, 'margin-top');
        }
      };

      var listeners = [
        DomEvent.bind(editorApi.body(), 'touchstart', function (evt) {
          editorApi.onTouchContent();
          tapping.fireTouchstart(evt);
        }),
        tapping.onTouchmove(),
        tapping.onTouchend(),

        editorApi.onToReading(Fun.noop)

      ].concat(
        isAndroid6 && false ? [ ] : [
          // DomEvent.bind(Element.fromDom(editorApi.win()), 'blur', function () {
          //   Css.remove(toolstrip, 'margin-top');
          // }),
          DomEvent.bind(outerDoc, 'select', function () {
            if (hasRangeInUi()) {
              Css.set(toolstrip, 'margin-top', ANDROID_CONTEXT_TOOLBAR_HEIGHT);
            } else {
              Css.remove(toolstrip, 'margin-top');
            }
          }),
          DomEvent.bind(editorApi.doc(), 'selectionchange', updateMargin)
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
