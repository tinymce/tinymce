import * as Binder from 'ephox/porkbun/Binder';
import * as Events from 'ephox/porkbun/Events';
import { Event, Bindable } from 'ephox/porkbun/Event';
import { Outlaw, ShootingEvent, Saloon } from './Types';

interface SaloonEvents {
  registry: {
    shooting: Bindable<ShootingEvent>;
  };
  trigger: {
    shooting: (shooter: Outlaw, target: Outlaw) => void;
  };
}

declare const $: any;

const create = function (): Saloon {
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
    shooting: Event([ 'shooter', 'target' ])
  }) as SaloonEvents;

  const binder = Binder.create();

  const seat = function (patron: Outlaw) {
    const chair = $('<div />');
    chair.css({ border: '1px dashed green', float: 'right', clear: 'both' });
    chair.append(patron.getElement());
    saloon.append(chair);
  };

  const unseat = function (patron: Outlaw) {
    const element = patron.getElement();
    const chair = element.parent();
    element.detach();
    chair.remove();
  };

  const enter = function (patron: Outlaw) {
    seat(patron);

    binder.bind(patron.events.shoot, function (event) {
      events.trigger.shooting(patron, event.target());
    });

    binder.bind(patron.events.die, function (_event) {
      stopListening(patron);
    });
  };

  const leave = function (patron: Outlaw) {
    unseat(patron);
    stopListening(patron);
  };

  const stopListening = function (outlaw: Outlaw) {
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

export {
  create
};
