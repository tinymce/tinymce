define(
  'tinymce.themes.mobile.ios.view.IosUpdates',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Futures',
    'ephox.sugar.api.properties.Css',
    'tinymce.themes.mobile.ios.scroll.IosScrolling',
    'tinymce.themes.mobile.ios.view.IosViewport'
  ],

  function (Arr, Future, Futures, Css, IosScrolling, IosViewport) {
    var updateFixed = function (element, property, winY, offsetY) {
      var destination = winY + offsetY;
      Css.set(element, property, destination + 'px');
      return Future.pure(offsetY);
    };

    var updateScrollingFixed = function (element, winY, offsetY) {
      var destTop = winY + offsetY;
      var oldProp = Css.getRaw(element, 'top').getOr(offsetY);
      // While we are changing top, aim to scroll by the same amount to keep the cursor in the same location.
      var delta = destTop - parseInt(oldProp, 10);
      var destScroll = element.dom().scrollTop + delta;
      return IosScrolling.moveScrollAndTop(element, destScroll, destTop);
    };

    var updateFixture = function (fixture, winY) {
      return fixture.fold(function (element, property, offsetY) {
        return updateFixed(element, property, winY, offsetY);
      }, function (element, offsetY) {
        return updateScrollingFixed(element, winY, offsetY);
      });
    };

    var updatePositions = function (container, winY) {
      var fixtures = IosViewport.findFixtures(container);
      var updates = Arr.map(fixtures, function (fixture) {
        return updateFixture(fixture, winY);
      });
      return Futures.par(updates);
    };

    return {
      updatePositions: updatePositions
    };
  }
);
