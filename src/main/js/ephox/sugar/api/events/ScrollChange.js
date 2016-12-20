define(
  'ephox.sugar.api.events.ScrollChange',

  [
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.view.Scroll'
  ],

  function (Fun, DomEvent, Scroll) {
    /* Some browsers (Firefox) fire a scroll event even if the values for scroll don't 
     * change. This acts as an intermediary between the scroll event, and the value for scroll
     * changing
     */
    var bind = function (doc, handler) {
      var lastScroll = Scroll.get(doc);
      var scrollBinder = DomEvent.bind(doc, 'scroll', function (event) {
        var scroll = Scroll.get(doc);
        if( (scroll.top() !== lastScroll.top()) || (scroll.left() !== lastScroll.left()) )
          handler(scroll);
        lastScroll = scroll;
      });

      return {
        unbind: scrollBinder.unbind
      };
    };

    return {
      bind: bind
    };
  }
);
