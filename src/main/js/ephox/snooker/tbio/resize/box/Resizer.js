define(
  'ephox.snooker.tbio.resize.box.Resizer',

  [
    'ephox.porkbun.Event',
    'ephox.porkbun.Events',
    'ephox.snooker.style.Styles',
    'ephox.sugar.api.Classes',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element'
  ],

  function (Event, Events, Styles, Classes, DomEvent, Element) {
    var nu = function () {
      var events = Events.create({
        click: Event([])
      });

      var resizer = Element.fromTag('div');
      Classes.add(resizer, [ Styles.resolve('adjust-se-resize')]);

      var element = function () {
        return resizer;
      };

      var destroy = function () {
        mousedown.unbind();
      };

      var mousedown = DomEvent.bind(resizer, 'mousedown', function (event) {
        // INVESTIGATE: Not sure if this prevent default should be at this level, or the next one up?
        event.raw().preventDefault();
        events.trigger.click();
      });

      return {
        element: element,
        destroy: destroy,
        events: events.registry
      };
    };

    return {
      nu: nu
    };
  }
);
