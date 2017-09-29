define(
  'tinymce.themes.mobile.ios.scroll.IosScrolling',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Future',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Classes',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.search.Traverse',
    'global!Math',
    'tinymce.themes.mobile.ios.smooth.SmoothAnimation',
    'tinymce.themes.mobile.ios.view.IosViewport',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.util.DataAttributes'
  ],

  function (Fun, Future, Attr, Classes, Css, Traverse, Math, SmoothAnimation, IosViewport, Styles, DataAttributes) {
    var animator = SmoothAnimation.create();

    var ANIMATION_STEP = 15;
    var NUM_TOP_ANIMATION_FRAMES = 10;
    var ANIMATION_RATE = 10;

    var lastScroll = 'data-' + Styles.resolve('last-scroll-top');

    var getTop = function (element) {
      var raw = Css.getRaw(element, 'top').getOr(0);
      return parseInt(raw, 10);
    };

    var getScrollTop = function (element) {
      return parseInt(element.dom().scrollTop, 10);
    };

    var moveScrollAndTop = function (element, destination, finalTop) {
      return Future.nu(function (callback) {
        var getCurrent = Fun.curry(getScrollTop, element);

        var update = function (newScroll) {
          element.dom().scrollTop = newScroll;
          Css.set(element, 'top', (getTop(element) + ANIMATION_STEP) + 'px');
        };

        var finish = function (/* dest */) {
          element.dom().scrollTop = destination;
          Css.set(element, 'top', finalTop + 'px');
          callback(destination);
        };

        animator.animate(getCurrent, destination, ANIMATION_STEP, update, finish, ANIMATION_RATE);
      });
    };

    var moveOnlyScroll = function (element, destination) {
      return Future.nu(function (callback) {
        var getCurrent = Fun.curry(getScrollTop, element);
        Attr.set(element, lastScroll, getCurrent());

        var update = function (newScroll, abort) {
          var previous = DataAttributes.safeParse(element, lastScroll);
          // As soon as we detect a scroll value that we didn't set, assume the user
          // is scrolling, and abort the scrolling.
          if (previous !== element.dom().scrollTop) {
            abort(element.dom().scrollTop);
          } else {
            element.dom().scrollTop = newScroll;
            Attr.set(element, lastScroll, newScroll);
          }
        };

        var finish = function (/* dest */) {
          element.dom().scrollTop = destination;
          Attr.set(element, lastScroll, destination);
          callback(destination);
        };

        // Identify the number of steps based on distance (consistent time)
        var distance = Math.abs(destination - getCurrent());
        var step = Math.ceil(distance / NUM_TOP_ANIMATION_FRAMES);
        animator.animate(getCurrent, destination, step, update, finish, ANIMATION_RATE);
      });
    };

    var moveOnlyTop = function (element, destination) {
      return Future.nu(function (callback) {
        var getCurrent = Fun.curry(getTop, element);

        var update = function (newTop) {
          Css.set(element, 'top', newTop + 'px');
        };

        var finish = function (/* dest */) {
          update(destination);
          callback(destination);
        };

        var distance = Math.abs(destination - getCurrent());
        var step = Math.ceil(distance / NUM_TOP_ANIMATION_FRAMES);
        animator.animate(getCurrent, destination, step, update, finish, ANIMATION_RATE);
      });
    };

    var updateTop = function (element, amount) {
      var newTop = (amount + IosViewport.getYFixedData(element)) + 'px';
      Css.set(element, 'top', newTop);
    };

    // Previously, we moved the window scroll back smoothly with the SmoothAnimation concept.
    // However, on tinyMCE, we seemed to get a lot more cursor flickering as the window scroll
    // was changing. Therefore, until tests prove otherwise, we are just going to jump to the
    // destination in one go.
    var moveWindowScroll = function (toolbar, viewport, destY) {
      var outerWindow = Traverse.owner(toolbar).dom().defaultView;
      return Future.nu(function (callback) {
        updateTop(toolbar, destY);
        updateTop(viewport, destY);
        outerWindow.scrollTo(0, destY);
        callback(destY);
      });
    };

    return {
      moveScrollAndTop: moveScrollAndTop,
      moveOnlyScroll: moveOnlyScroll,
      moveOnlyTop: moveOnlyTop,
      moveWindowScroll: moveWindowScroll
    };
  }
);
