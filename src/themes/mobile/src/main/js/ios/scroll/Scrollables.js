define(
  'tinymce.themes.mobile.ios.scroll.Scrollables',

  [
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.search.SelectorFind',
    'tinymce.themes.mobile.style.Styles'
  ],

  function (Fun, DomEvent, Attr, SelectorFind, Styles) {
    var dataHorizontal = 'data-' + Styles.resolve('horizontal-scroll');

    var canScrollVertically = function (container) {
      container.dom().scrollTop = 1;
      var result = container.dom().scrollTop !== 0;
      container.dom().scrollTop = 0;
      return result;
    };

    var canScrollHorizontally = function (container) {
      container.dom().scrollLeft = 1;
      var result = container.dom().scrollLeft !== 0;
      container.dom().scrollLeft = 0;
      return result;
    };

    var hasVerticalScroll = function (container) {
      return container.dom().scrollTop > 0 || canScrollVertically(container);
    };

    var hasHorizontalScroll = function (container) {
      return container.dom().scrollLeft > 0 || canScrollHorizontally(container);
    };

    var markAsHorizontal = function (container) {
      Attr.set(container, dataHorizontal, 'true');
    };

    var hasScroll = function (container) {
      return Attr.get(container, dataHorizontal) === 'true' ? hasHorizontalScroll : hasVerticalScroll;
    };

    /*
     * Prevents default on touchmove for anything that is not within a scrollable area. The
     * scrollable areas are defined by selector.
     */
    var exclusive = function (scope, selector) {
      return DomEvent.bind(scope, 'touchmove', function (event) {
        SelectorFind.closest(event.target(), selector).filter(hasScroll).fold(function () {
          event.raw().preventDefault();
        }, Fun.noop);
      });
    };

    return {
      exclusive: exclusive,
      markAsHorizontal: markAsHorizontal
    };
  }
);
