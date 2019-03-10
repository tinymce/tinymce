import { console } from '@ephox/dom-globals';

export default {
  title: 'Insert/Edit code sample',
  size: 'large',
  body: {
    type: 'panel',
    items: [
      {
        name: 'language',
        type: 'selectbox',
        label: 'Language',
        items: [
          {
            text: 'HTML/XML',
            value: 'html'
          },
          {
            text: 'JavaScript',
            value: 'js'
          }
        ]
      },
      {
        name: 'code',
        type: 'textarea'
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
    language: 'js',
    code: 'some js code'
  },
  onSubmit: (api) => {
    const data = api.getData();

    // tslint:disable-next-line:no-console
    console.log({
      language: data.language,
      code: data.code
    });

    api.close();
  }
};