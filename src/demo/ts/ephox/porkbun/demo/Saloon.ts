import Binder from 'ephox/porkbun/Binder';
import Events from 'ephox/porkbun/Events';
import Event from 'ephox/porkbun/Event';
import { Struct } from '@ephox/katamari';

declare const $: any;

var create = function () {
  var saloon = $('<div />');
  saloon.css({
    border: '3px solid brown',
    backgroundImage: 'url(images/saloon.jpg)',
    backgroundRepeat: 'no-repeat',
    width: '500px',
    float: 'left'
  });

  var getElement = function () {
    return saloon;
  };

  var events = Events.create({
    shooting: Event(["shooter", "target"])
  });

  var binder = Binder.create();

  var seat = function (patron) {
    var chair = $('<div />');
    chair.css({ border: '1px dashed green', float: 'right', clear: 'both' });
    chair.append(patron.getElement());
    saloon.append(chair);
  };

  var unseat = function (patron) {
    var element = patron.getElement();
    var chair = element.parent();
    element.detach();
    chair.remove();
  };

  var enter = function (patron) {
    seat(patron);

    binder.bind(patron.events.shoot, function (event) {
      events.trigger.shooting(patron, event.target());
    });

    binder.bind(patron.events.die, function (event) {
      stopListening(patron);
    });
  };

  var leave = function (patron) {
    unseat(patron);
    stopListening(patron);
  };

  var stopListening = function (outlaw) {
    binder.unbind(outlaw.events.shoot);
    binder.unbind(outlaw.events.die);
  };

  return {
    getElement: getElement,
    events: events.registry,
    enter: enter,
    leave: leave
  };
};

export default <any> {
  create: create
};