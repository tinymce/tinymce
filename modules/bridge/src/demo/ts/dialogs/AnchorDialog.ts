import { openDemoDialog } from './DemoDialogHelpers';

export const createAnchorDialog = (): void => {
  openDemoDialog(
    {
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
        id: 'myid'
      },
      onSubmit: (api) => {
        const data = api.getData();

        // eslint-disable-next-line no-console
        console.log({
          id: data.id
        });

        api.close();
      }
    }
  );
};
