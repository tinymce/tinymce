define(
  'ephox.alloy.api.system.NoContextApi',

  [
    'ephox.alloy.api.system.SystemApi',
    'ephox.alloy.log.AlloyLogger',
    'ephox.katamari.api.Fun',
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
        triggerEscape: fail('triggerEscape'),
        build: fail('build'),
        addToWorld: fail('addToWorld'),
        removeFromWorld: fail('removeFromWorld'),
        addToGui: fail('addToGui'),
        removeFromGui: fail('removeFromGui'),
        getByUid: fail('getByUid'),
        getByDom: fail('getByDom'),
        broadcast: fail('broadcast'),
        broadcastOn: fail('broadcastOn')
      });
    };
  }
);