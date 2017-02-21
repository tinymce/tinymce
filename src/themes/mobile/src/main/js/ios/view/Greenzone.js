define(
  'tinymce.themes.mobile.ios.view.Greenzone',

  [
    'ephox.nomad.api.Cursor',
    'ephox.nomad.ios.DeviceZones',
    'ephox.nomad.ios.IosScrolling',
    'ephox.peanut.Fun',
    'global!parseInt'
  ],

  function (Cursor, DeviceZones, IosScrolling, Fun, parseInt) {
    var scrollIntoView = function (cWin, socket, top, bottom) {
      var greenzone = DeviceZones.getGreenzone(socket);
      var refreshCursor = Fun.curry(Cursor.refresh, cWin);

      if (top > greenzone || bottom > greenzone) {
        IosScrolling.moveOnlyScroll(socket, socket.dom().scrollTop - greenzone + bottom).get(refreshCursor);
      } else if (top < 0) {
        IosScrolling.moveOnlyScroll(socket, socket.dom().scrollTop + top).get(refreshCursor);
      }
    };

    return {
      scrollIntoView: scrollIntoView
    };
  }
);