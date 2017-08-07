define(
  'tinymce.themes.mobile.ios.view.IosViewport',

  [
    'ephox.katamari.api.Adt',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.search.SelectorFilter',
    'ephox.sugar.api.search.Traverse',
    'ephox.sugar.api.view.Height',
    'tinymce.themes.mobile.ios.view.DeviceZones',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.touch.scroll.Scrollable',
    'tinymce.themes.mobile.util.DataAttributes'
  ],

  function (Adt, Arr, Fun, Attr, Css, SelectorFilter, Traverse, Height, DeviceZones, Styles, Scrollable, DataAttributes) {
    var fixture = Adt.generate([
      { 'fixed': [ 'element', 'property', 'offsetY' ] },
      // Not supporting property yet
      { 'scroller' :[ 'element', 'offsetY' ] }
    ]);

    var yFixedData = 'data-' + Styles.resolve('position-y-fixed');
    var yFixedProperty = 'data-' + Styles.resolve('y-property');
    var yScrollingData = 'data-' + Styles.resolve('scrolling');
    var windowSizeData = 'data-' + Styles.resolve('last-window-height');

    var getYFixedData = function (element) {
      return DataAttributes.safeParse(element, yFixedData);
    };

    var getYFixedProperty = function (element) {
      return Attr.get(element, yFixedProperty);
    };

    var getLastWindowSize = function (element) {
      return DataAttributes.safeParse(element, windowSizeData);
    };

    var classifyFixed = function (element, offsetY) {
      var prop = getYFixedProperty(element);
      return fixture.fixed(element, prop, offsetY);
    };

    var classifyScrolling = function (element, offsetY) {
      return fixture.scroller(element, offsetY);
    };

    var classify = function (element) {
      var offsetY = getYFixedData(element);
      var classifier = Attr.get(element, yScrollingData) === 'true' ? classifyScrolling : classifyFixed;
      return classifier(element, offsetY);
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
      Attr.set(toolbar, yFixedProperty, 'top');

      var restore = function () {
        Attr.set(toolbar, 'style', oldToolbarStyle || '');
        Attr.remove(toolbar, yFixedData);
        Attr.remove(toolbar, yFixedProperty);
      };

      return {
        restore: restore
      };
    };

    var takeoverViewport = function (toolbarHeight, height, viewport) {
      var oldViewportStyle = Attr.get(viewport, 'style');

      Scrollable.register(viewport);
      Css.setAll(viewport, {
        'position': 'absolute',
        // I think there a class that does this overflow scrolling touch part
        'height': height + 'px',
        'width': '100%',
        'top': toolbarHeight + 'px'
      });

      Attr.set(viewport, yFixedData, toolbarHeight + 'px');
      Attr.set(viewport, yScrollingData, 'true');
      Attr.set(viewport, yFixedProperty, 'top');

      var restore = function () {
        Scrollable.deregister(viewport);
        Attr.set(viewport, 'style', oldViewportStyle || '');
        Attr.remove(viewport, yFixedData);
        Attr.remove(viewport, yScrollingData);
        Attr.remove(viewport, yFixedProperty);
      };

      return {
        restore: restore
      };
    };

    var takeoverDropup = function (dropup, toolbarHeight, viewportHeight) {
      var oldDropupStyle = Attr.get(dropup, 'style');
      Css.setAll(dropup, {
        position: 'absolute',
        bottom: '0px'
      });

      Attr.set(dropup, yFixedData, '0px');
      Attr.set(dropup, yFixedProperty, 'bottom');

      var restore = function () {
        Attr.set(dropup, 'style', oldDropupStyle || '');
        Attr.remove(dropup, yFixedData);
        Attr.remove(dropup, yFixedProperty);
      };

      return {
        restore: restore
      };
    };

    var deriveViewportHeight = function (viewport, toolbarHeight, dropupHeight) {
      // Note, Mike thinks this value changes when the URL address bar grows and shrinks. If this value is too high
      // the main problem is that scrolling into the greenzone may not scroll into an area that is viewable. Investigate.
      var outerWindow = Traverse.owner(viewport).dom().defaultView;
      var winH = outerWindow.innerHeight;
      Attr.set(viewport, windowSizeData, winH + 'px');
      return winH - toolbarHeight - dropupHeight;
    };

    var takeover = function (viewport, contentBody, toolbar, dropup) {
      var outerWindow = Traverse.owner(viewport).dom().defaultView;
      var toolbarSetup = takeoverToolbar(toolbar);
      var toolbarHeight = Height.get(toolbar);
      var dropupHeight = Height.get(dropup);
      var viewportHeight = deriveViewportHeight(viewport, toolbarHeight, dropupHeight);

      var viewportSetup = takeoverViewport(toolbarHeight, viewportHeight, viewport);

      var dropupSetup = takeoverDropup(dropup, toolbarHeight, viewportHeight);

      var isActive = true;

      var restore = function () {
        isActive = false;
        toolbarSetup.restore();
        viewportSetup.restore();
        dropupSetup.restore();
      };

      var isExpanding = function () {
        var currentWinHeight = outerWindow.innerHeight;
        var lastWinHeight = getLastWindowSize(viewport);
        return currentWinHeight > lastWinHeight;
      };

      var refresh = function () {
        if (isActive) {
          var newToolbarHeight = Height.get(toolbar);
          var dropupHeight = Height.get(dropup);
          var newHeight = deriveViewportHeight(viewport, newToolbarHeight, dropupHeight);
          Attr.set(viewport, yFixedData, newToolbarHeight + 'px');
          Css.set(viewport, 'height', newHeight + 'px');

          Css.set(dropup, 'bottom', -(newToolbarHeight + newHeight + dropupHeight) + 'px');
          DeviceZones.updatePadding(contentBody, viewport, dropup);
        }
      };

      var setViewportOffset = function (newYOffset) {
        var offsetPx = newYOffset + 'px';
        Attr.set(viewport, yFixedData, offsetPx);
        // The toolbar height has probably changed, so recalculate the viewport height.
        refresh();
      };

      DeviceZones.updatePadding(contentBody, viewport, dropup);

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
