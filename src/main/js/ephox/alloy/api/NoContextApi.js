define(
  'ephox.alloy.api.NoContextApi',

  [
    'ephox.alloy.api.SystemApi',
    'ephox.peanut.Fun'
  ],

  function (SystemApi, Fun) {
    return function () {
      return SystemApi({
        debugInfo: Fun.constant('fake'),
        triggerEvent: Fun.die('The component must be in a context to send event: trigger'),
        triggerFocus: Fun.die('The component must be in a context to send event: triggerFocus'),
        build: Fun.die('The component must be in a context to send event: build'),
        addToWorld: Fun.die('The component must be in a context to addToWorld'),
        getByUid: Fun.die('The component must be in a context to getByUid'),
        getByDom: Fun.die('The compoennt must be in a context to getByDom')
      });
    };
  }
);