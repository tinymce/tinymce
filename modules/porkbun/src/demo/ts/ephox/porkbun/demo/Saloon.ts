import { Fun } from '@ephox/katamari';

import * as Binder from 'ephox/porkbun/Binder';
import { Bindable, Event } from 'ephox/porkbun/Event';
import * as Events from 'ephox/porkbun/Events';

import { Outlaw, Saloon, ShootingEvent } from './Types';

interface SaloonEvents {
  registry: {
    shooting: Bindable<ShootingEvent>;
  };
  trigger: {
    shooting: (shooter: Outlaw, target: Outlaw) => void;
  };
}

declare const $: any;

const create = (): Saloon => {
  const saloon = $('<div />');
  saloon.css({
    border: '3px solid brown',
    backgroundImage: 'url(images/saloon.jpg)',
    backgroundRepeat: 'no-repeat',
    width: '500px',
    float: 'left'
  });

  const getElement = Fun.constant(saloon);

  const events: SaloonEvents = Events.create({
    shooting: Event([ 'shooter', 'target' ])
  });

  const binder = Binder.create();

  const seat = (patron: Outlaw) => {
    const chair = $('<div />');
    chair.css({ border: '1px dashed green', float: 'right', clear: 'both' });
    chair.append(patron.getElement());
    saloon.append(chair);
  };

  const unseat = (patron: Outlaw) => {
    const element = patron.getElement();
    const chair = element.parent();
    element.detach();
    chair.remove();
  };

  const enter = (patron: Outlaw) => {
    seat(patron);

    binder.bind(patron.events.shoot, (event) => {
      events.trigger.shooting(patron, event.target);
    });

    binder.bind(patron.events.die, (_event) => {
      stopListening(patron);
    });
  };

  const leave = (patron: Outlaw) => {
    unseat(patron);
    stopListening(patron);
  };

  const stopListening = (outlaw: Outlaw) => {
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
