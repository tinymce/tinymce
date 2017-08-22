define(
  'tinymce.themes.mobile.ios.view.DeviceZones',

  [
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.search.Traverse',
    'ephox.sugar.api.view.Height',
    'tinymce.themes.mobile.ios.view.Devices',
    'tinymce.themes.mobile.touch.view.Orientation'
  ],

  function (Css, Traverse, Height, Devices, Orientation) {
    // Green zone is the area below the toolbar and above the keyboard, its considered the viewable
    // region that is not obstructed by the keyboard. If the keyboard is down, then the Green Zone is larger.

      /*
          _______________________
          |        toolbar      |
          |_____________________|
          |                     |
          |                     |
          |       greenzone     |
          |_____________________|
          |                     |
          |       keyboard      |
          |_____________________|

      */

    var softKeyboardLimits = function (outerWindow) {
      return Devices.findDevice(outerWindow.screen.width, outerWindow.screen.height);
    };

    var accountableKeyboardHeight = function (outerWindow) {
      var portrait = Orientation.get(outerWindow).isPortrait();
      var limits = softKeyboardLimits(outerWindow);

      var keyboard = portrait ? limits.portrait : limits.landscape;

      var visualScreenHeight = portrait ? outerWindow.screen.height : outerWindow.screen.width;

      // This is our attempt to detect when we are in a webview. If the DOM window height is smaller than the
      // actual screen height by about the size of a keyboard, we assume that's because a keyboard is
      // causing it to be that small. We will improve this at a later date.
      return (visualScreenHeight - outerWindow.innerHeight) > keyboard ? 0 : keyboard;
    };

    var getGreenzone = function (socket, dropup) {
      var outerWindow = Traverse.owner(socket).dom().defaultView;
      // Include the dropup for this calculation because it represents the total viewable height.
      var viewportHeight = Height.get(socket) + Height.get(dropup);
      var acc = accountableKeyboardHeight(outerWindow);
      return viewportHeight - acc;
    };

    var updatePadding = function (contentBody, socket, dropup) {
      var greenzoneHeight = getGreenzone(socket, dropup);
      var deltaHeight = (Height.get(socket) + Height.get(dropup)) - greenzoneHeight;
      // TBIO-3878 Changed the element that was receiving the padding from the iframe to the body of the
      // iframe's document. The reasoning for this is that the syncHeight function of IosSetup.js relies on
      // the scrollHeight of the body to set the height of the iframe itself. If we don't set the
      // padding-bottom on the body, the scrollHeight is too short, effectively disappearing the content from view.
      Css.set(contentBody, 'padding-bottom', deltaHeight + 'px');
    };

    return {
      getGreenzone: getGreenzone,
      updatePadding: updatePadding
    };
  }
);