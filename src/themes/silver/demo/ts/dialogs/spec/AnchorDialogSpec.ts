import { console } from '@ephox/dom-globals';

export default {
  title: 'Anchor',
  body: {
    type: 'panel',
    items: [
      {
        name: 'id',
        type: 'input',
        label: 'Id'
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
    id: 'myid'
  },
  onSubmit: (api) => {
    const data = api.getData();

    // tslint:disable-next-line:no-console
    console.log({
      id: data.id
    });

    api.close();
  }
};