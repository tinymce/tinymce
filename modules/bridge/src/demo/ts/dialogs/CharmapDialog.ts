import { openDemoDialog } from './DemoDialogHelpers';

/* eslint-disable no-console */

export const createCharmapDialog = (): void => {
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
          // eslint-disable-next-line no-console
          console.log({
            char: details.value
          });

          api.close();
        }
      }
    }
  );
};
