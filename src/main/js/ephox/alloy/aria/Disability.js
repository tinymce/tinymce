define(
  'ephox.alloy.aria.Disability',

  [
    'ephox.sugar.api.Attr'
  ],

  function (Attr) {
    // Used by cyclic type.
// FIX: Is there a better way of sharing this code? Probably should be in sugar.
    return {
      isDisabledElem: function (elem) {
        return Attr.has(elem, 'disabled') || Attr.get(elem, 'aria-disabled') === 'true';
      }
    };
  }
);