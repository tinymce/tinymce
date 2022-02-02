import { Fun } from '@ephox/katamari';

import { Saloon, Sherif, ShootingEvent } from './Types';

declare const $: any;

const create = (): Sherif => {
  const container = $('<div />');
  container.css({
    float: 'left',
    width: '200px',
    textAlign: 'center'
  });

  const img = $('<img src="images/chuck-norris.jpg" />');
  img.height('200px');

  const caption = $('<p>Sheriff</p>');
  caption.css({ textAlign: 'center', fontWeight: 'bold' });

  const chaseButton = $('<button disabled="true">Give chase</button>');

  const actions = $('<div />');
  actions.css({ float: 'right' });

  actions.append(chaseButton);
  caption.append(actions);
  container.append(img, caption);

  const getElement = Fun.constant(container);

  const watch = (establishment: Saloon) => {
    establishment.events.shooting.bind(shooting);
  };

  const shooting = (event: ShootingEvent) => {
    chaseButton.attr('disabled', false);
    chaseButton.bind('click', () => {
      chaseButton.detach();
      event.shooter.chase();
    });
  };

  return {
    getElement,
    watch
  };
};

export {
  create
};
