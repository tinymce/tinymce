define(
  'ephox.sugar.api.events.Viewable',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Throttler',
    'ephox.sand.api.Window',
    'ephox.sugar.api.search.Traverse',
    'ephox.sugar.api.view.Visibility',
    'global!clearInterval',
    'global!setInterval',
    'global!window'
  ],

  function (Fun, Throttler, Window, Traverse, Visibility, clearInterval, setInterval, window) {
    /*
     * Long term it's probably worth looking at using a single event per page the way Resize does.
     * This could get a bit slow with a lot of editors in a heavy page.
     *
     * It's a bit harder to manage, though, because visibility is a one-shot listener.
     */

    var poll = function (element, f) {
      var poller = setInterval(f, 500);

      var unbindPoll = function () {
        clearInterval(poller);
      };
      return unbindPoll;
    };

    var mutate = function (element, f) {
      var observer = new window.MutationObserver(f);

      var unbindMutate = function () {
        observer.disconnect();
      };

      // childList is super expensive, but required on Safari where the iframe has no width or height immediately.
      // If it becomes a performance issue, we can make childList === isSafari but thus far Sugar has no platform detection so that would be a sad day.
      observer.observe(Traverse.owner(element).dom(), { attributes: true, subtree: true, childList: true, attributeFilter: [ 'style', 'class' ]});

      return unbindMutate;
    };

    // IE11 and above, not using numerosity so we can poll on IE10
    var wait = window.MutationObserver !== undefined && window.MutationObserver !== null ? mutate : poll;

    var onShow = function (element, f) {
      if (Visibility.isVisible(element)) {
        Window.requestAnimationFrame(f);
        return Fun.noop;
      } else {
        // these events might come in thick and fast, so throttle them
        var throttler = Throttler.adaptable(function () {
          if (Visibility.isVisible(element)) {
            unbind();
            Window.requestAnimationFrame(f);
          }
        }, 100);

        var unbind = wait(element, throttler.throttle);

        return unbind;
      }
    };

    return {
      onShow: onShow
    };
  }
);