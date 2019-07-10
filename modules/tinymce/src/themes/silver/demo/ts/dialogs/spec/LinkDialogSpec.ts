/* tslint:disable:no-console */
import { console } from '@ephox/dom-globals';

export default {
  title: 'Insert link',
  body: {
    type: 'panel',
    items: [
      {
        name: 'url',
        type: 'urlinput',
        filetype: 'file',
        label: 'URL'
      },
      {
        name: 'text',
        type: 'input',
        label: 'Text to display'
      },
      {
        name: 'title',
        type: 'input',
        label: 'Title'
      },
      {
        name: 'target',
        type: 'selectbox',
        label: 'Target',
        items: [
          {
            text: 'None',
            value: ''
          },
          {
            text: 'Blank',
            value: '_blank'
          },
        ]
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
  initialData: {
    url: { value: 'my.html', text: 'my.html', meta: { } },
    text: 'Some text',
    title: 'Some title',
    target: '_blank'
  },
  onSubmit: (api) => {
    const data = api.getData();

    console.log({
      url: data.url,
      text: data.text,
      title: data.title,
      target: data.target
    });

    api.close();
  }
};
