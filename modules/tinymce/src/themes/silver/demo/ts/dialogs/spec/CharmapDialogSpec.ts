import { console } from '@ephox/dom-globals';

export default {
  title: 'Special character',
  body: {
    type: 'panel',
    items: [
      {
        name: 'char',
        type: 'collection',
        // TODO TINY-3229 implement collection columns properly
        // columns: 'auto'
      }
    ]
  },
  buttons: [
    {
      type: 'cancel',
      name: 'close',
      text: 'Close'
    }
  ],
  initialData: {
    id: 'myid',
    char: [
      {
        text: 'At sign',
        value: '@',
        icon: '@'
      },
      {
        text: 'Exclamation mark',
        value: '!',
        icon: '!'
      },
      {
        text: 'Asterisk',
        value: '*',
        icon: '*'
      }
    ]
  },
  onAction: (api, details) => {
    if (details.name === 'char') {
      // Would log '@' if the At sign is clicked these values doesn't have to be part of the state model
      // tslint:disable-next-line:no-console
      console.log({
        char: details.value
      });

      api.close();
    }
  }
};