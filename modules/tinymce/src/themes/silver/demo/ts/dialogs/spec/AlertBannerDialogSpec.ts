import { window } from '@ephox/dom-globals';

export default {
  title: 'AlertBanner',
  body: {
    type: 'panel',
    items: [
      {
        type: 'alertbanner',
        text: 'Demo the alert banner message',
        level: 'warn',
        icon: 'help',
        url: 'https://www.tiny.cloud/'
      }
    ]
  },
  buttons: [
    {
      type: 'cancel',
      name: 'cancel',
      text: 'Cancel'
    },
    {
      type: 'submit',
      name: 'save',
      text: 'Save',
      primary: true
    }
  ],
  onSubmit: (api) => {
    api.close();
  },
  onAction: (api, detail) => {
    if (detail.name === 'alert-banner' && detail.value && detail.value.substr(0, 4) === 'http') {
      window.open(detail.value);
    }
  }
};