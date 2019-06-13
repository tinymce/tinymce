import { Saloon, ShootingEvent, Sherif } from './Types';

declare const $: any;

const create = function (): Sherif {
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

  const getElement = function () {
    return container;
  };

  const watch = function (establishment: Saloon) {
    establishment.events.shooting.bind(shooting);
  };

  const shooting = function (event: ShootingEvent) {
    chaseButton.attr('disabled', false);
    chaseButton.bind('click', function () {
      chaseButton.detach();
      event.shooter().chase();
    });
  };

  return {
    getElement,
    watch
  };
};

export default {
  create
};