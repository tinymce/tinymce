define(
  'ephox.alloy.api.NoContextApi',

  [
    'ephox.alloy.api.SystemApi',
    'ephox.alloy.log.AlloyLogger',
    'ephox.peanut.Fun',
    'global!Error'
  ],

  function (SystemApi, AlloyLogger, Fun, Error) {
    return function (getComp) {
      var fail = function (event) {
        return function () {
          throw new Error('The component must be in a context to send: ' + event + '\n' + 
            AlloyLogger.element(getComp().element()) + ' is not in context.'
          );
        };
      };

      return SystemApi({
        debugInfo: Fun.constant('fake'),
        triggerEvent: fail('triggerEvent'),
        triggerFocus: Fun.die(new Error('The component must be in a context to send event: triggerFocus')),
        build: Fun.die(new Error('The component must be in a context to send event: build')),
        addToWorld: Fun.die(new Error('The component must be in a context to addToWorld')),
        removeFromWorld: Fun.die(new Error('The component must be in a context to removeFromWorld')),
        getByUid: Fun.die(new Error('The component must be in a context to getByUid')),
        getByDom: Fun.die(new Error('The component must be in a context to getByDom')),
        broadcast: fail('broadcast'),
        broadcastOn: fail('broadcastOn')
      });
    };
  }
);