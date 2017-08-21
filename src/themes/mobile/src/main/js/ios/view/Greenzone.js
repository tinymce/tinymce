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

      if (top > greenzone || bottom > greenzone) {
        IosScrolling.moveOnlyScroll(socket, socket.dom().scrollTop - greenzone + bottom).get(refreshCursor);
      } else if (top < 0) {
        IosScrolling.moveOnlyScroll(socket, socket.dom().scrollTop + top).get(refreshCursor);
      } else {
        // do nothing
      }
    };

    return {
      scrollIntoView: scrollIntoView
    };
  }
);