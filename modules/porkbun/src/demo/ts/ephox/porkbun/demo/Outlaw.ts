import { Fun, Singleton } from '@ephox/katamari';

import { Bindable, Event } from 'ephox/porkbun/Event';
import * as Events from 'ephox/porkbun/Events';

import { DieEvent, Outlaw, Saloon, ShootEvent } from './Types';

interface OutlawEvents {
  registry: {
    shoot: Bindable<ShootEvent>;
    die: Bindable<DieEvent>;
  };
  trigger: {
    shoot: (target: Outlaw) => void;
    die: () => void;
  };
}

declare const $: any;

const create = (name: string): Outlaw => {
  const container = $('<div />');
  container.css({ width: '1px dashed gray' });

  const character = $('<div />');
  character.css({ width: '200px', float: 'left' });

  const img = $('<img src="images/outlaw.jpg" />');
  img.height('200px');

  const actions = $('<div />');
  actions.css({ float: 'right' });

  const caption = $('<p>');
  caption.text(name);
  caption.css({ textAlign: 'center', fontWeight: 'bold' });

  caption.append(actions);
  character.append(img, caption);
  container.append(character);

  const getElement = Fun.constant(container);

  const addAction = (text: string, action: () => void) => {
    const button = $('<button />');
    button.text(text);
    button.bind('click', () => {
      action();
      button.detach();
    });
    actions.append(button);
  };

  const events: OutlawEvents = Events.create({
    shoot: Event([ 'target' ]),
    die: Event([])
  });

  const establishment = Singleton.value<Saloon>();
  const enter = (saloon: Saloon) => {
    saloon.enter(api);
    establishment.set(saloon);
  };

  const leave = () => {
    establishment.on((e) => e.leave(api));
    establishment.clear();
  };

  const shoot = (target: Outlaw) => {
    target.die();
    events.trigger.shoot(target);
  };

  const die = () => {
    img.attr('src', 'images/gravestone.jpg');
    actions.remove();
    events.trigger.die();
  };

  const chase = () => {
    leave();
  };

  const api = {
    getElement,
    addAction,
    events: events.registry,
    enter,
    leave,
    shoot,
    die,
    chase
  };

  return api;
};

export {
  create
};
