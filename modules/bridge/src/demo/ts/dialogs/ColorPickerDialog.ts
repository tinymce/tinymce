import { console } from '@ephox/dom-globals';
import { openDemoDialog } from './DemoDialogHelpers';

// tslint:disable:no-console

export const createColorPickerDialog = () => {
  openDemoDialog(
    {
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
          type: 'submit',
          name: 'ok',
          text: 'Ok',
          primary: true
        },
        {
          type: 'cancel',
          name: 'cancel',
          text: 'Cancel'
        }
      ],
      initialData: {
        color: '#FF00FF'
      },
      onChange: (api, details) => {
        if (details.name === 'color') {
          // Hex representation of the RGB value
          console.log('Color was changed to', api.getData().color);
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
    }
  );
};
