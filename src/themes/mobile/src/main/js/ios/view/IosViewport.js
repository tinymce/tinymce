define(
  'tinymce.themes.mobile.ios.view.IosViewport',

  [
    'ephox.katamari.api.Adt',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.search.SelectorFilter',
    'ephox.sugar.api.view.Height',
    'ephox.sugar.api.view.Scroll',
    'global!window',
    'tinymce.themes.mobile.ios.view.DeviceZones',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.util.DataAttributes'
  ],

  function (
    Adt, Arr, Fun, Attr, Css, SelectorFilter, Height, Scroll, window, DeviceZones, Styles,
    DataAttributes
  ) {
    var fixture = Adt.generate([
      { 'fixed': [ 'element', 'offsetY' ] },
      { 'scroller' :[ 'element', 'offsetY' ] }
    ]);

    var yFixedData = 'data-' + Styles.resolve('position-y-fixed');
    var yScrollingData = 'data-' + Styles.resolve('scrolling');
    var windowSizeData = 'data-' + Styles.resolve('last-window-height');

    var getYFixedData = function (element) {
      return DataAttributes.safeParse(element, yFixedData);
    };

    var getLastWindowSize = function (element) {
      return DataAttributes.safeParse(element, windowSizeData);
    };

    var classify = function (element) {
      var offsetY = getYFixedData(element);
      var type = Attr.get(element, yScrollingData) === 'true' ? fixture.scroller : fixture.fixed;
      return type(element, offsetY);
    };

    var findFixtures = function (container) {
      var candidates = SelectorFilter.descendants(container, '[' + yFixedData + ']');
      return Arr.map(candidates, classify);
    };

    var takeoverToolbar = function (toolbar) {
      var oldToolbarStyle = Attr.get(toolbar, 'style');
      Css.setAll(toolbar, {
        position: 'absolute',
        top: '0px'
      });

      Attr.set(toolbar, yFixedData, '0px');

      var restore = function () {
        Attr.set(toolbar, 'style', oldToolbarStyle || '');
        Attr.remove(toolbar, yFixedData);
      };

      return {
        restore: restore
      };
    };

    var takeoverViewport = function (toolbarHeight, height, viewport) {
      var oldViewportStyle = Attr.get(viewport, 'style');

      Scroll.register(viewport);
      Css.setAll(viewport, {
        'position': 'absolute',
        // I think there a class that does this overflow scrolling touch part
        'height': height + 'px',
        'width': '100%',
        'top': toolbarHeight + 'px'
      });

      Attr.set(viewport, yFixedData, toolbarHeight + 'px');
      Attr.set(viewport, yScrollingData, 'true');

      var restore = function () {
        Scroll.deregister(viewport);
        Attr.set(viewport, 'style', oldViewportStyle || '');
        Attr.remove(viewport, yFixedData);
        Attr.remove(viewport, yScrollingData);
      };

      return {
        restore: restore
      };
    };

    var deriveViewportHeight = function (viewport, toolbarHeight) {
      // Note, Mike thinks this value changes when the URL address bar grows and shrinks. If this value is too high
      // the main problem is that scrolling into the greenzone may not scroll into an area that is viewable. Investigate.
      var winH = window.innerHeight;
      Attr.set(viewport, windowSizeData, winH + 'px');
      return winH - toolbarHeight;
    };

    var takeover = function (viewport, contentBody, toolbar) {
      var toolbarSetup = takeoverToolbar(toolbar);
      var toolbarHeight = Height.get(toolbar);
      var viewportHeight = deriveViewportHeight(viewport, toolbarHeight);

      var viewportSetup = takeoverViewport(toolbarHeight, viewportHeight, viewport);

      var restore = function () {
        toolbarSetup.restore();
        viewportSetup.restore();
      };

      var isExpanding = function () {
        var currentWinHeight = window.innerHeight;
        var lastWinHeight = getLastWindowSize(viewport);
        return currentWinHeight > lastWinHeight;
      };

      var refresh = function () {
        var newToolbarHeight = Height.get(toolbar);
        var newHeight = deriveViewportHeight(viewport, newToolbarHeight);
        Attr.set(viewport, yFixedData, newToolbarHeight + 'px');
        Css.set(viewport, 'height', newHeight + 'px');
        DeviceZones.updatePadding(contentBody, viewport);
      };

      var setViewportOffset = function (newYOffset) {
        var offsetPx = newYOffset + 'px';
        Attr.set(viewport, yFixedData, offsetPx);
        // The toolbar height has probably changed, so recalculate the viewport height.
        refresh();
      };

      DeviceZones.updatePadding(contentBody, viewport);

      return {
        setViewportOffset: setViewportOffset,
        isExpanding: isExpanding,
        isShrinking: Fun.not(isExpanding),
        refresh: refresh,
        restore: restore
      };
    };

    return {
      findFixtures: findFixtures,
      takeover: takeover,
      getYFixedData: getYFixedData
    };
  }
);
