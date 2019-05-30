import { console } from '@ephox/dom-globals';
import { openDemoDialog } from './DemoDialogHelpers';

// tslint:disable:no-console

export const createCharmapDialog = () => {
  openDemoDialog(
    {
      title: 'Special character',
      body: {
        type: 'panel',
        items: [
          {
            name: 'chars',
            type: 'collection'
          }
        ]
      },
      buttons: [
        {
          type: 'cancel',
          name: 'cancel',
          text: 'Cancel'
        }
      ],
      initialData: {
        id: 'myid',
        chars: [
          {
            text: 'At sign',
            value: '@'
          }
        ]
      },
      onAction: (api, details) => {
        if (details.name === 'chars') {
          // Would log '@' if the At sign is clicked these values doesn't have to be part of the state model
          console.log({
            char: details.value
          });

          api.close();
        }
      }
    }
  );
};
