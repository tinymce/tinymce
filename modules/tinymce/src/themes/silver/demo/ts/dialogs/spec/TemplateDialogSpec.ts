import { console } from '@ephox/dom-globals';

export default {
  title: 'Insert template',
  body: {
    type: 'panel',
    items: [
      {
        name: 'template',
        type: 'selectbox',
        label: 'Template',
        items: [
          {
            text: 'Some template 1',
            value: 'url1.html'
          },
          {
            text: 'Some template 2',
            value: 'url2.html'
          }
        ]
      },
      {
        name: 'preview',
        type: 'iframe',
        label: 'Preview of template'
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
    template: 'url2.html',
    preview: 'some html url'
  },
  onSubmit: (api) => {
    const data = api.getData();

    // tslint:disable-next-line:no-console
    console.log({
      template: data.template
    });

    api.close();
  }
};