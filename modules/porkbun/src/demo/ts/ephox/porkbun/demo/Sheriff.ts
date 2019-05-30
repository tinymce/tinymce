import { Struct } from '@ephox/katamari';

declare const $: any;

var create = function () {
  var container = $('<div />');
  container.css({
    float: 'left',
    width: "200px",
    textAlign: 'center'
  });

  var img = $('<img src="images/chuck-norris.jpg" />');
  img.height('200px');

  var caption = $('<p>Sheriff</p>');
  caption.css({ textAlign: 'center', fontWeight: 'bold' });

  var chaseButton = $('<button disabled="true">Give chase</button>');

  var actions = $('<div />');
  actions.css({ float: 'right' });

  actions.append(chaseButton);
  caption.append(actions);
  container.append(img, caption);

  var getElement = function () {
    return container;
  };

  var watch = function (establishment) {
    establishment.events.shooting.bind(shooting);
  };

  var shooting = function (event) {
    chaseButton.attr('disabled', false);
    chaseButton.bind('click', function () {
      chaseButton.detach();
      event.shooter().chase();
    });
  };

  return {
    getElement: getElement,
    watch: watch
  };
};

export default <any> {
  create: create
};