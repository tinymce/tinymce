import Binder from 'ephox/porkbun/Binder';
import Events from 'ephox/porkbun/Events';
import { Event } from 'ephox/porkbun/Event';
import { Struct } from '@ephox/katamari';

declare const $: any;

const create = function () {
  const saloon = $('<div />');
  saloon.css({
    border: '3px solid brown',
    backgroundImage: 'url(images/saloon.jpg)',
    backgroundRepeat: 'no-repeat',
    width: '500px',
    float: 'left'
  });

  const getElement = function () {
    return saloon;
  };

  const events = Events.create({
    shooting: Event(['shooter', 'target'])
  });

  const binder = Binder.create();

  const seat = function (patron) {
    const chair = $('<div />');
    chair.css({ border: '1px dashed green', float: 'right', clear: 'both' });
    chair.append(patron.getElement());
    saloon.append(chair);
  };

  const unseat = function (patron) {
    const element = patron.getElement();
    const chair = element.parent();
    element.detach();
    chair.remove();
  };

  const enter = function (patron) {
    seat(patron);

    binder.bind(patron.events.shoot, function (event) {
      events.trigger.shooting(patron, event.target());
    });

    binder.bind(patron.events.die, function (event) {
      stopListening(patron);
    });
  };

  const leave = function (patron) {
    unseat(patron);
    stopListening(patron);
  };

  const stopListening = function (outlaw) {
    binder.unbind(outlaw.events.shoot);
    binder.unbind(outlaw.events.die);
  };

  return {
    getElement,
    events: events.registry,
    enter,
    leave
  };
};

export default {
  create
};