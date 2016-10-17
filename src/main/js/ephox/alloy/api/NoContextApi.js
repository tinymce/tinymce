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
        triggerFocus: fail('triggerFocus'),
        build: fail('build'),
        addToWorld: fail('addToWorld'),
        removeFromWorld: fail('removeFromWorld'),
        getByUid: fail('getByUid'),
        getByDom: fail('getByDom'),
        broadcast: fail('broadcast'),
        broadcastOn: fail('broadcastOn')
      });
    };
  }
);