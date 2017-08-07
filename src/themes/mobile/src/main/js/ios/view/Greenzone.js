define(
  'tinymce.themes.mobile.ios.view.Greenzone',

  [
    'ephox.katamari.api.Fun',
    'global!parseInt',
    'tinymce.themes.mobile.ios.scroll.IosScrolling',
    'tinymce.themes.mobile.ios.view.DeviceZones',
    'tinymce.themes.mobile.touch.focus.CursorRefresh'
  ],

  function (Fun, parseInt, IosScrolling, DeviceZones, CursorRefresh) {
    var scrollIntoView = function (cWin, socket, dropup, top, bottom) {
      var greenzone = DeviceZones.getGreenzone(socket, dropup);
      var refreshCursor = Fun.curry(CursorRefresh.refresh, cWin);
      console.log('Checking: top', top, 'bottom', bottom, 'greenzone', greenzone);

      if (top > greenzone || bottom > greenzone) {
        console.log('scrolling between the destination is below the greenzone', 'top', top, 'greenzone', greenzone, 'bottom', bottom);
        IosScrolling.moveOnlyScroll(socket, socket.dom().scrollTop - greenzone + bottom).get(refreshCursor);
      } else if (top < 0) {
        console.log('scrolling because the destination is above the screen');
        IosScrolling.moveOnlyScroll(socket, socket.dom().scrollTop + top).get(refreshCursor);
      } else {
        console.log('no need to scroll');
      }
    };

    return {
      scrollIntoView: scrollIntoView
    };
  }
);