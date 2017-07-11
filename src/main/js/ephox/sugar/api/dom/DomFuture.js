define(
  'ephox.sugar.api.dom.DomFuture',

  [
    'ephox.katamari.api.Future',
    'ephox.katamari.api.LazyValue',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.events.DomEvent',
    'global!clearTimeout',
    'global!setTimeout'
  ],

  function (Future, LazyValue, Result, DomEvent, clearTimeout, setTimeout) {
    var w = function (fType, element, eventType, timeout) {
      return fType(function (callback) {
        var listener = DomEvent.bind(element, eventType, function (event) {
          clearTimeout(time);
          listener.unbind();
          callback(Result.value(event));
        });

        var time = setTimeout(function () {
          listener.unbind();
          callback(Result.error('Event ' + eventType + ' did not fire within ' + timeout + 'ms'));
        }, timeout);
      });
    };

    var cWaitFor = function (element, eventType, timeout) {
      return w(LazyValue.nu, element, eventType, timeout);
    };

    var waitFor = function (element, eventType, timeout) {
      return w(Future.nu, element, eventType, timeout);
    };


    return {
      cWaitFor: cWaitFor,
      waitFor: waitFor
    };
  }
);