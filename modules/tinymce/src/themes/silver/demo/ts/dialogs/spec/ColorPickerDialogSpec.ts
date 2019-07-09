/* tslint:disable:no-console */
import { console } from '@ephox/dom-globals';

export default {
  title: 'colorbox',
  body: {
    type: 'panel',
    items: [
      {
        name: 'color',
        type: 'colorpicker'
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
    color: '#FF00FF'
  },
  onChange: (api, details) => {
    if (details.name === 'color') {
      // Hex representation of the RGB value
      console.log('Color was changed to', details.value);
    }
  },
  onSubmit: (api) => {
    const data = api.getData();

    // Submit is only exectuted when the form has valid data
    console.log({
      code: data.color
    });

    api.close();
  }
};
