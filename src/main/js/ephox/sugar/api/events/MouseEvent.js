define(
  'ephox.sugar.api.events.MouseEvent',

  [
    'ephox.sugar.impl.FilteredEvent'
  ],

  function (FilteredEvent) {
    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
    var isLeftClick = function (raw) {
      return raw.button === 0;
    };

    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
    var isLeftButtonPressed = function (raw) {
      // Only added by Chrome/Firefox in June 2015.
      // This is only to fix a 1px bug (TBIO-2836) so return true if we're on an older browser
      if (raw.buttons === undefined) return true;

      // use bitwise & for optimal comparison
      return (raw.buttons & 1) !== 0;
    };

    // Not 100% sure whether this works, so use with caution
    var isRealClick = function (raw) {
      // Firefox non-standard property
      // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent#mozInputSource
      return (raw.mozInputSource === 6 || raw.mozInputSource === 0) ? false
        // standards, only gecko/webkit as of Sept 2015
        // https://developer.mozilla.org/en-US/docs/Web/API/Event/isTrusted
        : raw.isTrusted !== undefined && raw.isTrusted !== true ? false
        // fallback to yes because there's no other way to really know
        : true;
    };

    var filtered = function (event, filter) {
      return {
        bind: function (element, f) {
          return FilteredEvent.bind(element, event, filter, f);
        }
      };
    };

    return {
      realClick: filtered('click', isRealClick),
      leftDown: filtered('mousedown', isLeftClick),
      leftPressedOver: filtered('mouseover', isLeftButtonPressed),
      leftUp: filtered('mouseup', isLeftClick)
    };
  }
);