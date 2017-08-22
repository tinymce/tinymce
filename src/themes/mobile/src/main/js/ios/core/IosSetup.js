define(
  'tinymce.themes.mobile.ios.core.IosSetup',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Throttler',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Css',
    'global!clearInterval',
    'global!clearTimeout',
    'global!console',
    'global!Math',
    'global!parseInt',
    'global!setInterval',
    'global!setTimeout',
    'tinymce.themes.mobile.ios.focus.FakeSelection',
    'tinymce.themes.mobile.ios.scroll.IosScrolling',
    'tinymce.themes.mobile.ios.smooth.BackgroundActivity',
    'tinymce.themes.mobile.ios.view.Greenzone',
    'tinymce.themes.mobile.ios.view.IosUpdates',
    'tinymce.themes.mobile.ios.view.IosViewport',
    'tinymce.themes.mobile.touch.view.Orientation',
    'tinymce.themes.mobile.util.CaptureBin',
    'tinymce.themes.mobile.util.Rectangles'
  ],

  function (
    Fun, Option, Throttler, Focus, DomEvent, Body, Element, Css, clearInterval, clearTimeout, console, Math, parseInt, setInterval, setTimeout, FakeSelection,
    IosScrolling, BackgroundActivity, Greenzone, IosUpdates, IosViewport, Orientation, CaptureBin, Rectangles
  ) {
    var VIEW_MARGIN = 5;

    var register = function (toolstrip, socket, container, outerWindow, structure, cWin) {
      var scroller = BackgroundActivity(function (y) {
        return IosScrolling.moveWindowScroll(toolstrip, socket, y);
      });

      // NOTE: This is a WebView specific way of scrolling when out of bounds. When we need to make
      // the webapp work again, we'll have to adjust this function. Essentially, it just jumps the scroll
      // back to show the current selection rectangle.
      var scrollBounds = function () {
        var rects = Rectangles.getRectangles(cWin);
        return Option.from(rects[0]).bind(function (rect) {
          var viewTop = rect.top() - socket.dom().scrollTop;
          var outside = viewTop > outerWindow.innerHeight + VIEW_MARGIN || viewTop < -VIEW_MARGIN;
          return outside ? Option.some({
            top: Fun.constant(viewTop),
            bottom: Fun.constant(viewTop + rect.height())
          }) : Option.none();
        });
      };

      var scrollThrottle = Throttler.last(function () {
        /*
         * As soon as the window is back to 0 (idle), scroll the toolbar and socket back into place on scroll.
         */
        scroller.idle(function () {
          IosUpdates.updatePositions(container, outerWindow.pageYOffset).get(function (/* _ */) {
            var extraScroll = scrollBounds();
            extraScroll.each(function (extra) {
              // TODO: Smoothly animate this in a way that doesn't conflict with anything else.
              socket.dom().scrollTop = socket.dom().scrollTop + extra.top();
            });
            scroller.start(0);
            structure.refresh();
          });
        });
      }, 1000);

      var onScroll = DomEvent.bind(Element.fromDom(outerWindow), 'scroll', function () {
        if (outerWindow.pageYOffset < 0) {
          return;
        }

        /*
        We've experimented with trying to set the socket scroll (hidden vs. scroll) based on whether the outer body
        has scrolled. When the window starts scrolling, we would lock the socket scroll, and we would
        unlock it when the window stopped scrolling. This would give a nice rubber-band effect at the end
        of the content, but would break the code that tried to position the text in the viewable area
        (more details below). Also, as soon as you flicked to outer scroll, if you started scrolling up again,
        you would drag the whole window down, because you would still be in outerscroll mode. That's hardly
        much of a problem, but it is a minor issue. It also didn't play nicely with keeping the toolbar on the screen.

        The big problem was that this was incompatible with the toolbar and scrolling code. We need a padding inside
        the socket so that the bottom of the content can be scrolled into the viewable greenzone. If it doesn't
        have padding, then unless we move the socket top to some negative value as well, then we can't get
        a scrollTop high enough to get the selection into the viewable greenzone. This is the purpose of the
        padding at the bottom of the iframe. Without it, the scroll consistently jumps back to its
        max scroll value, and you can't keep the last line on screen when the keyboard is up.

        However, if the padding is too large, then the content can be 'effectively' scrolled off the screen
        (the iframe anyway), and the user can get lost about where they are. Our short-term fix is just to
        make the padding at the end the height - the greenzone height so that content should always be
        visible on the screen, even if they've scrolled to the end.
        */

        scrollThrottle.throttle();
      });

      IosUpdates.updatePositions(container, outerWindow.pageYOffset).get(Fun.identity);

      return {
        unbind: onScroll.unbind
      };
    };

    var setup = function (bag) {
      var cWin = bag.cWin();
      var ceBody = bag.ceBody();
      var socket = bag.socket();
      var toolstrip = bag.toolstrip();
      var toolbar = bag.toolbar();
      var contentElement = bag.contentElement();
      var keyboardType = bag.keyboardType();
      var outerWindow = bag.outerWindow();
      var dropup = bag.dropup();

      var structure = IosViewport.takeover(socket, ceBody, toolstrip, dropup);
      var keyboardModel = keyboardType(bag.outerBody(), cWin, Body.body(), contentElement, toolstrip, toolbar);

      var toEditing = function () {
        // Consider inlining, though it will make it harder to follow the API
        keyboardModel.toEditing();
        clearSelection();
      };

      var toReading = function () {
        keyboardModel.toReading();
      };

      var onToolbarTouch = function (event) {
        keyboardModel.onToolbarTouch(event);
      };

      var onOrientation = Orientation.onChange(outerWindow, {
        onChange: Fun.noop,
        onReady: structure.refresh
      });

      // NOTE: When the window is resizing (probably due to meta tags and viewport definitions), we are not receiving a window resize event.
      // However, it happens shortly after we start Ios mode, so here we just wait for the first window size event that we get. This code
      // is also the same code that is used for the Orientation ready event.
      onOrientation.onAdjustment(function () {
        structure.refresh();
      });

      var onResize = DomEvent.bind(Element.fromDom(outerWindow), 'resize', function () {
        if (structure.isExpanding()) {
          structure.refresh();
        }
      });

      var onScroll = register(toolstrip, socket, bag.outerBody(), outerWindow, structure, cWin);

      var unfocusedSelection = FakeSelection(cWin, contentElement);

      var refreshSelection = function () {
        if (unfocusedSelection.isActive()) {
          unfocusedSelection.update();
        }
      };

      var highlightSelection = function () {
        unfocusedSelection.update();
      };

      var clearSelection = function () {
        unfocusedSelection.clear();
      };

      var scrollIntoView = function (top, bottom) {
        Greenzone.scrollIntoView(cWin, socket, dropup, top, bottom);
      };

      var syncHeight = function () {
        Css.set(contentElement, 'height', contentElement.dom().contentWindow.document.body.scrollHeight + 'px');
      };

      var setViewportOffset = function (newYOffset) {
        structure.setViewportOffset(newYOffset);
        IosScrolling.moveOnlyTop(socket, newYOffset).get(Fun.identity);
      };

      var destroy = function () {
        structure.restore();
        onOrientation.destroy();
        onScroll.unbind();
        onResize.unbind();
        keyboardModel.destroy();

        unfocusedSelection.destroy();

        // Try and dismiss the keyboard on close, as they have no input focus.
        CaptureBin.input(Body.body(), Focus.blur);
      };

      return {
        toEditing: toEditing,
        toReading: toReading,
        onToolbarTouch: onToolbarTouch,
        refreshSelection: refreshSelection,
        clearSelection: clearSelection,
        highlightSelection: highlightSelection,
        scrollIntoView: scrollIntoView,
        updateToolbarPadding: Fun.noop,
        setViewportOffset: setViewportOffset,
        syncHeight: syncHeight,
        refreshStructure: structure.refresh,
        destroy: destroy
      };
    };

    return {
      setup: setup
    };
  }
);