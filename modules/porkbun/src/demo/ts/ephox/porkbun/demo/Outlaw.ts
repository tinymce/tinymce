import { Event } from 'ephox/porkbun/Event';
import Events from 'ephox/porkbun/Events';

declare const $: any;

const create = function (name: string) {
  const container = $('<div />');
  container.css({  width: '1px dashed gray' });

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

  const getElement = function () {
    return container;
  };

  const addAction = function (text, action) {
    const button = $('<button />');
    button.text(text);
    button.bind('click', function () {
      action();
      button.detach();
    });
    actions.append(button);
  };

  const events = Events.create({
    shoot: Event(['target']),
    die:   Event([])
  });

  let establishment;
  const enter = function (saloon) {
    saloon.enter(api);
    establishment = saloon;
  };

  const leave = function () {
    establishment.leave(api);
    establishment = undefined;
  };

  const shoot = function (target) {
    target.die();
    events.trigger.shoot(target);
  };

  const die = function () {
    img.attr('src', 'images/gravestone.jpg');
    actions.remove();
    events.trigger.die();
  };

  const chase = function () {
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

export default {
  create
};