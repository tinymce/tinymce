define(
  'tinymce.themes.mobile.ios.view.IosUpdates',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Future',
    'ephox.sugar.api.properties.Css',
    'tinymce.themes.mobile.ios.scroll.IosScrolling',
    'tinymce.themes.mobile.ios.view.IosViewport'
  ],

  function (Arr, Future, Css, IosScrolling, IosViewport) {
    var updateFixed = function (element, winY, offsetY) {
      var destination = winY + offsetY;
      Css.set(element, 'top', destination + 'px');
      return Future.pure(offsetY);
    };

    var updateScrollingFixed = function (element, winY, offsetY) {
      var destTop = winY + offsetY;
      var oldTop = Css.getRaw(element, 'top').getOr(offsetY);
      // While we are changing top, aim to scroll by the same amount to keep the cursor in the same location.
      var delta = destTop - parseInt(oldTop, 10);
      var destScroll = element.dom().scrollTop + delta;
      return IosScrolling.moveScrollAndTop(element, destScroll, destTop);
    };

    var updateFixture = function (fixture, winY) {
      return fixture.fold(function (element, offsetY) {
        return updateFixed(element, winY, offsetY);
      }, function (element, offsetY) {
        return updateScrollingFixed(element, winY, offsetY);
      });
    };

    var updatePositions = function (container, winY) {
      var fixtures = IosViewport.findFixtures(container);
      var updates = Arr.map(fixtures, function (fixture) {
        return updateFixture(fixture, winY);
      });
      return Future.par(updates);
    };

    return {
      updatePositions: updatePositions
    };
  }
);
